// @ts-ignore
import TIM from 'tim-js-sdk';
// @ts-ignore
// import TIMUploadPlugin from 'tim-upload-plugin';
import logger from '../../utils/logger';
import Event from '../common/emitter/event';
import TUIRoomError from './base/TUIRoomError';
import TUIRoomResponse from './base/TUIRoomResponse';
import { ETUIRoomEvents } from './types.d';
import { TUIRoomErrorCode, TUIRoomErrorMessage } from './constant';
import { simpleClone } from './util';
import TUIRoomConfig from './base/TUIRoomConfig';

class TIMService {
  static logPrefix = '[TIMService]';

  private SDKAppID = 0;

  private isSdkReady = false;

  private isLogin = false;

  private userID = '';

  private userSig = '';

  private tim: any;

  private groupID = '';

  private emitter = new Event();

  private loginResolveRejectCache: Array<{
    resolve: (value: TUIRoomResponse<any>) => void;
    reject: (reason?: any) => void;
  }>;

  constructor() {
    this.loginResolveRejectCache = [];
    this.onTIMReadyStateUpdate = this.onTIMReadyStateUpdate.bind(this);
    this.onError = this.onError.bind(this);
    this.onMessageReceived = this.onMessageReceived.bind(this);
  }

  /**
   * 初始化
   * @param options
   */
  public init(options: {
    SDKAppID: number;
    userID: string;
    userSig: string;
    tim: any;
  }) {
    const { SDKAppID, userID, userSig, tim } = options;
    this.SDKAppID = SDKAppID;
    this.userID = userID;
    this.userSig = userSig;
    this.tim = tim;
    // this.tim.setLogLevel(0);
    // this.tim.registerPlugin({ 'tim-upload-plugin': TIMUploadPlugin });

    this.bindEvent();
  }

  /**
   * 前置检查方法
   *
   * 很多方法在调用前需要 SDK ready 且等了，此为公共校验方法
   */
  private preCheckMethodCall() {
    if (!this.isSdkReady) {
      throw TUIRoomError.error(
        TUIRoomErrorCode.SDK_NOT_READY,
        TUIRoomErrorMessage.SDK_NOT_READY
      );
    }

    if (!this.isLogin) {
      throw TUIRoomError.error(
        TUIRoomErrorCode.NOT_LOGIN,
        TUIRoomErrorMessage.NOT_LOGIN
      );
    }
  }

  /**
   * /////////////////////////////////////////////////////////////////////////////////
   * //
   * //                                    进退群方法
   * //
   * /////////////////////////////////////////////////////////////////////////////////
   */
  /**
   * 创建 IM 群
   *
   * 先检查群是否存在，如果不存在，则新建。
   * 如果存在，则检查当前用户是否群主，如果是群主，则加入群，
   * 如果当前用户非群主，则提示房间号已被占用。
   * @param groupID - 群ID
   * @returns
   */
  async createGroup(
    groupID: string,
    roomConfig: TUIRoomConfig
  ): Promise<TUIRoomResponse<any>> {
    logger.debug(`${TIMService.logPrefix}.createGroup groupID: ${groupID}`);
    this.preCheckMethodCall();

    this.groupID = groupID;
    let groupInfo = null;
    let isGroupExist = false;
    let timResponse = null;
    try {
      timResponse = await this.tim.searchGroupByID(this.groupID);
      groupInfo = timResponse.data.group;
      isGroupExist = true;
    } catch (error: any) {
      // 群不存在，需要新建
    }
    try {
      // 群存在
      if (isGroupExist) {
        if (groupInfo.ownerID === this.userID) {
          logger.log(
            `${TIMService.logPrefix}createGroup: group exist and current user is owner.`,
            groupInfo
          );
          timResponse = await this.tim.updateGroupProfile({
            groupID: this.groupID,
            notification: JSON.stringify(roomConfig),
          });
          groupInfo = timResponse.data.group;
        } else {
          // 群已存在，当前用户不是群主，说明房间已存在，不能创建
          throw TUIRoomError.error(
            TUIRoomErrorCode.ROOM_EXISTED,
            TUIRoomErrorMessage.ROOM_EXISTED
          );
        }
      } else {
        // 群不存在，新建，Public 群创建后会直接加入
        timResponse = await this.tim.createGroup({
          type: TIM.TYPES.GRP_PUBLIC,
          name: this.groupID,
          groupID: this.groupID,
          joinOption: TIM.TYPES.JOIN_OPTIONS_FREE_ACCESS, // 允许自由加入
          notification: JSON.stringify(roomConfig),
        });
        groupInfo = timResponse.data.group;
        logger.log(`${TIMService.logPrefix}createGroup response:`, timResponse);
      }
      return TUIRoomResponse.success(groupInfo);
    } catch (error: any) {
      if (error instanceof TUIRoomError) {
        throw error;
      } else {
        logger.error(`${TIMService.logPrefix}createGroup error:`, error);
        throw TUIRoomError.error(
          TUIRoomErrorCode.CREATE_GROUP_ERROR,
          TUIRoomErrorMessage.CREATE_GROUP_ERROR
        );
      }
    }
  }

  async dismissGroup(): Promise<TUIRoomResponse<any>> {
    this.preCheckMethodCall();

    try {
      await this.tim.dismissGroup(this.groupID);
      return TUIRoomResponse.success();
    } catch (error: any) {
      logger.error(`${TIMService.logPrefix}dismissGroup error:`, error);
      throw TUIRoomError.error(
        TUIRoomErrorCode.DISMISS_GROUP_ERROR,
        TUIRoomErrorMessage.DISMISS_GROUP_ERROR
      );
    }
  }

  async joinGroup(groupID: string): Promise<TUIRoomResponse<any>> {
    logger.debug(`${TIMService.logPrefix}.joinGroup groupID: ${groupID}`);
    this.preCheckMethodCall();

    this.groupID = groupID;
    try {
      let groupInfo = null;
      const imResponse = await this.tim.joinGroup({
        groupID: this.groupID,
        type: TIM.TYPES.GRP_PUBLIC,
      });
      // 已经在群中
      if (imResponse.data.status === TIM.TYPES.JOIN_STATUS_ALREADY_IN_GROUP) {
        const imSearchResponse = await this.tim.searchGroupByID(this.groupID);
        groupInfo = imSearchResponse.data.group;
      } else {
        groupInfo = imResponse.data.group; // 加入的群组资料
      }
      logger.log(`${TIMService.logPrefix}joinGroup groupInfo:`, groupInfo);
      return TUIRoomResponse.success(groupInfo);
    } catch (error: any) {
      logger.error(`${TIMService.logPrefix}joinGroup error:`, error);
      throw TUIRoomError.error(
        TUIRoomErrorCode.JOIN_GROUP_ERROR,
        TUIRoomErrorMessage.JOIN_GROUP_ERROR
      );
    }
  }

  async quitGroup(): Promise<TUIRoomResponse<any>> {
    this.preCheckMethodCall();

    try {
      await this.tim.quitGroup(this.groupID);
      return TUIRoomResponse.success();
    } catch (error: any) {
      logger.error(`${TIMService.logPrefix}quitGroup error:`, error);
      throw TUIRoomError.error(
        TUIRoomErrorCode.QUIT_GROUP_ERROR,
        TUIRoomErrorMessage.QUIT_GROUP_ERROR
      );
    }
  }

  async checkGroupExistence(groupID: string): Promise<TUIRoomResponse<any>> {
    logger.debug(
      `${TIMService.logPrefix}.checkGroupExistence groupID: ${groupID}`
    );
    this.preCheckMethodCall();

    let groupInfo = null;
    const realGroupID = groupID;
    try {
      const response = await this.tim.searchGroupByID(realGroupID);
      groupInfo = response.data.group;
    } catch (error: any) {
      // 群不存在
    }
    return TUIRoomResponse.success(groupInfo);
  }

  /**
   * /////////////////////////////////////////////////////////////////////////////////
   * //
   * //                                   IM 事件处理
   * //
   * /////////////////////////////////////////////////////////////////////////////////
   */
  // 事件绑定
  private bindEvent() {
    this.tim.on(TIM.EVENT.SDK_READY, this.onTIMReadyStateUpdate);
    this.tim.on(TIM.EVENT.SDK_NOT_READY, this.onTIMReadyStateUpdate);
    this.tim.on(TIM.EVENT.ERROR, this.onError);
    this.tim.on(TIM.EVENT.MESSAGE_RECEIVED, this.onMessageReceived);
  }

  // 解除事件绑定
  private unbindEvent() {
    this.tim.off(TIM.EVENT.SDK_READY, this.onTIMReadyStateUpdate);
    this.tim.off(TIM.EVENT.SDK_NOT_READY, this.onTIMReadyStateUpdate);
    this.tim.off(TIM.EVENT.ERROR, this.onError);
    this.tim.off(TIM.EVENT.MESSAGE_RECEIVED, this.onMessageReceived);
  }

  // 处理 SDK Ready 事件
  private onTIMReadyStateUpdate(event: Record<string, any>) {
    logger.debug(`${TIMService.logPrefix}onTIMReadyStateUpdate event:`, event);
    const isSDKReady = event.name === TIM.EVENT.SDK_READY;
    if (isSDKReady) {
      this.isSdkReady = true;
      this.isLogin = true;
      this.loginResolveRejectCache.forEach(({ resolve }) => {
        resolve(TUIRoomResponse.success());
      });
    } else {
      this.isSdkReady = false;
      this.isLogin = false;
      this.loginResolveRejectCache.forEach(({ reject }) => {
        reject(
          TUIRoomError.error(
            TUIRoomErrorCode.LOGIN_ERROR,
            JSON.stringify(event)
          )
        );
      });

      // 退出登录后，注销绑定的事件处理函数
      this.unbindEvent();
    }
    this.loginResolveRejectCache = [];
  }

  // 处理 IM 报错事件
  // eslint-disable-next-line class-methods-use-this
  private onError(error: any) {
    logger.error(`${TIMService.logPrefix}onError error:`, error);
  }

  // 处理消息接收事件
  private onMessageReceived(event: Record<string, any>) {
    logger.log(`${TIMService.logPrefix}onMessageReceived message:`, event);
    event.data.forEach((message: Record<string, any>) => {
      switch (message.type) {
        case TIM.TYPES.MSG_TEXT:
          this.handleTextMessage(message);
          break;
        case TIM.TYPES.MSG_CUSTOM:
          this.handleCustomMessage(message);
          break;
        case TIM.TYPES.MSG_GRP_SYS_NOTICE:
          this.handleGroupNotice(message);
          break;
        default:
          logger.warn(
            `${TIMService.logPrefix}onMessageReceived ignored message:`,
            message
          );
      }
    });
  }

  /**
   * /////////////////////////////////////////////////////////////////////////////////
   * //
   * //                              不同消息类型的处理方法
   * //
   * /////////////////////////////////////////////////////////////////////////////////
   */
  private handleTextMessage(message: Record<string, any>) {
    logger.log(`${TIMService.logPrefix}handleTextMessage message:`, message);
    this.emitter.emit(
      ETUIRoomEvents.onReceiveChatMessage,
      simpleClone(message)
    );
  }

  private handleCustomMessage(message: Record<string, any>) {
    logger.log(`${TIMService.logPrefix}handleCustomMessage message:`, message);
    this.emitter.emit(
      ETUIRoomEvents.onReceiveCustomMessage,
      simpleClone(message)
    );
  }

  private handleGroupNotice(message: Record<string, any>) {
    logger.log(`${TIMService.logPrefix}handleGroupNotice message:`, message);
    const { operationType } = message.payload;
    switch (operationType) {
      case 5:
        // 收到群解散通知，向上层抛出房间销毁事件
        this.emitter.emit(ETUIRoomEvents.onRoomDestroyed, null);
        break;
      default:
        logger.warn(
          `${TIMService.logPrefix}handleGroupNotice ignored notice:`,
          message
        );
    }
  }

  /**
   * /////////////////////////////////////////////////////////////////////////////////
   * //
   * //                                    消息发送接口
   * //
   * /////////////////////////////////////////////////////////////////////////////////
   */
  async sendChatMessage(text: string): Promise<TUIRoomResponse<any>> {
    this.preCheckMethodCall();
    try {
      const message = this.tim.createTextMessage({
        to: this.groupID,
        conversationType: TIM.TYPES.CONV_GROUP,
        payload: {
          text,
        },
      });
      const imResponse = await this.tim.sendMessage(message);
      logger.log(`${TIMService.logPrefix}sendChatMessage success:`, imResponse);
      if (imResponse.code === 0) {
        return TUIRoomResponse.success(simpleClone(imResponse.data.message));
      }
      throw TUIRoomError.error(
        TUIRoomErrorCode.SEND_MESSAGE_ERROR,
        imResponse.message || TUIRoomErrorMessage.SEND_MESSAGE_ERROR
      );
    } catch (error: any) {
      logger.error(`${TIMService.logPrefix}sendChatMessage error:`, error);
      throw TUIRoomError.error(
        TUIRoomErrorCode.SEND_MESSAGE_ERROR,
        TUIRoomErrorMessage.SEND_MESSAGE_ERROR
      );
    }
  }

  async sendCustomMessage(
    type: string,
    data: string
  ): Promise<TUIRoomResponse<any>> {
    this.preCheckMethodCall();
    try {
      const message = this.tim.createCustomMessage({
        to: this.groupID,
        conversationType: TIM.TYPES.CONV_GROUP,
        payload: {
          data,
          description: type,
          extension: '',
        },
      });
      const imResponse = await this.tim.sendMessage(message);
      if (imResponse.code === 0) {
        return TUIRoomResponse.success(simpleClone(imResponse.data.message));
      }
      throw TUIRoomError.error(
        TUIRoomErrorCode.SEND_CUSTOM_MESSAGE_ERROR,
        imResponse.message || TUIRoomErrorMessage.SEND_CUSTOM_MESSAGE_ERROR
      );
    } catch (error: any) {
      logger.error(`${TIMService.logPrefix}sendCustomMessage error:`, error);
      throw TUIRoomError.error(
        TUIRoomErrorCode.SEND_CUSTOM_MESSAGE_ERROR,
        TUIRoomErrorMessage.SEND_CUSTOM_MESSAGE_ERROR
      );
    }
  }

  /**
   * /////////////////////////////////////////////////////////////////////////////////
   * //
   * //                                    事件回调注册接口
   * //
   * /////////////////////////////////////////////////////////////////////////////////
   */
  /**
   * 监听 TIM 事件
   *
   * 重构过程中，临时提供此方法
   * @param eventName - 事件名
   * @param handler - 事件处理函数
   * @deprecated
   */
  on(eventName: string, handler: (...args: any) => void) {
    this.tim?.on(eventName, handler);
  }

  /**
   * 取消 TIM 事件监听
   *
   * 重构过程中，临时提供此方法
   * @param eventName - 事件名
   * @param handler - 事件处理函数
   * @deprecated
   */
  off(eventName: string, handler: (...args: any) => void) {
    this.tim?.on(eventName, handler);
  }

  // 监听 TUIRoom 事件
  onRoomEvent(
    eventName: string,
    handler: (...args: any) => void,
    ctx?: Record<string, any>
  ) {
    this.emitter.on(eventName, handler, ctx);
  }

  // 取消 TUIRoom 事件监听
  offRoomEvent(eventName: string, handler: (...args: any) => void) {
    this.emitter.off(eventName, handler);
  }

  /**
   * /////////////////////////////////////////////////////////////////////////////////
   * //
   * //                  重构过程中，向后兼容，添加的方法，重构完成后需要去除
   * //
   * /////////////////////////////////////////////////////////////////////////////////
   */

  /**
   * 发送消息
   * @param message - 待发送消息
   * @returns {Promise}
   * @deprecated
   */
  async sendMessage(message: Record<string, any>) {
    const response = await this.tim.sendMessage(message);
    return response;
  }

  /**
   * 创建自定义消息
   *
   * @deprecated
   */
  createCustomMessage(options: Record<string, any>) {
    return this.tim.createCustomMessage(options);
  }

  /**
   * /////////////////////////////////////////////////////////////////////////////////
   * //
   * //                                    其他方法
   * //
   * /////////////////////////////////////////////////////////////////////////////////
   */
  public async destroy() {
    this.unbindEvent();
    this.SDKAppID = 0;
    this.userID = '';
    this.userSig = '';
    this.groupID = '';
    this.isSdkReady = false;
    this.isLogin = false;
    this.tim = null;
    if (this.loginResolveRejectCache.length) {
      this.loginResolveRejectCache.forEach(({ reject }) => {
        reject(
          TUIRoomError.error(
            TUIRoomErrorCode.ROOM_BEEN_DESTROYED,
            TUIRoomErrorMessage.ROOM_BEEN_DESTROYED
          )
        );
      });
      this.loginResolveRejectCache = [];
    }
    return TUIRoomResponse.success();
  }
}

export default TIMService;
