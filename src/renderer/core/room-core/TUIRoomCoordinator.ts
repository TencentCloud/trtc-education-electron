// @ts-ignore
import TIM from 'tim-js-sdk';
// @ts-ignore
import Emitter from '../common/emitter/event';
import TUIRoomResponse from './base/TUIRoomResponse';
import TUIRoomConfig from './base/TUIRoomConfig';
import TUIRoomError from './base/TUIRoomError';
import {
  TUIRoomErrorCode,
  TUIRoomErrorMessage,
  CommonConstant,
  TSignalingConfig,
} from './constant';
import ITUIRoomCoordinator from './ITUIRoomCoordinator';
import logger from '../../utils/logger';
import TSignalingService from './TSignalingService';
import StateStore from './StateStore';
import {
  ETUIRoomEvents,
  ETUIRoomCoordinatorConfig,
  ETUIRoomCoordinatorCommand,
  TTUIRoomConfig,
  TTUIRoomTSBase,
  ETUIRoomRole,
} from './types.d';

import { safelyParseJSON, simpleClone } from './util';

class TUIRoomCoordinator implements ITUIRoomCoordinator {
  private static logPrefix = '[TUIRoomCoordinator]';

  private groupID = '';

  private roomID = '';

  private state: any;

  private tim: any;

  private emitter: Emitter | null;

  private tsignalingService: any;

  constructor(state: StateStore, tsignalingService: TSignalingService) {
    if (!state || !tsignalingService) {
      throw TUIRoomError.error(
        TUIRoomErrorCode.INVALID_PARAM_ERROR,
        TUIRoomErrorMessage.INVALID_PARAM_ERROR
      );
    }
    this.state = state;
    this.tsignalingService = tsignalingService;

    this.emitter = new Emitter();
  }

  /**
   *  初始化
   */
  init(options: { roomID: string; tim: any }) {
    const { roomID, tim } = options;
    this.roomID = roomID;
    this.groupID = `${CommonConstant.groupIDPrefix}${roomID}`;
    this.tim = tim;
    this.bindTIMEvent();
    this.bindTSignalingEvent();
    this.handleInitNotification(this.state.roomInfo.roomConfig);
  }

  // 进入房间，处理初始化的公告
  private handleInitNotification(roomConfig: TTUIRoomConfig) {
    const { isCallingRoll, isAllMicMuted } = roomConfig;
    if (isCallingRoll) {
      this.emitter?.emit(
        ETUIRoomEvents.onCallingRollStarted,
        roomConfig.isCallingRoll
      );
    }
    if (isAllMicMuted) {
      if (this.state.currentUser.role !== ETUIRoomRole.MASTER) {
        this.emitter?.emit(
          ETUIRoomEvents.onMicrophoneMuted,
          roomConfig.isAllMicMuted
        );
      }
    }
  }

  async setControlConfig(
    roomConfig: TTUIRoomConfig
  ): Promise<TUIRoomResponse<any>> {
    logger.debug(
      `${TUIRoomCoordinator.logPrefix}setControlConfig params:`,
      roomConfig,
      this
    );
    try {
      await this.tim.updateGroupProfile({
        groupID: this.groupID,
        notification: JSON.stringify(roomConfig),
      });
      return TUIRoomResponse.success(roomConfig);
    } catch (error: any) {
      logger.error(
        `${TUIRoomCoordinator.logPrefix}setControlConfig error:`,
        error
      );
      throw TUIRoomError.error(
        TUIRoomErrorCode.SET_ROOM_CONTROL_CONFIG_ERROR,
        TUIRoomErrorMessage.SET_ROOM_CONTROL_CONFIG_ERROR
      );
    }
  }

  async getControlConfig(): Promise<TUIRoomResponse<TUIRoomConfig | null>> {
    logger.debug(`${TUIRoomCoordinator.logPrefix}getControlConfig`, this);
    try {
      const response = await this.tim.getGroupProfile({
        groupID: this.groupID,
        groupCustomFieldFilter: ['notification'],
      });
      logger.log(`${TUIRoomCoordinator.logPrefix}getGroupAttributes`, response);
      const { group } = response.data;
      if (group.notification) {
        try {
          const roomConfig = safelyParseJSON(group.notification);
          return TUIRoomResponse.success(roomConfig);
        } catch (error: any) {
          logger.error(
            `${TUIRoomCoordinator.logPrefix}getControlConfig parse group notification error:`,
            group.notification
          );
        }
      }
      return TUIRoomResponse.success(null);
    } catch (error: any) {
      // 群不存在，需要新建
      throw TUIRoomError.error(
        TUIRoomErrorCode.GROUP_NOT_EXIST_ERROR,
        TUIRoomErrorMessage.GROUP_NOT_EXIST_ERROR
      );
    }
  }

  async muteUserMicrophone(
    userID: string,
    mute: boolean
  ): Promise<TUIRoomResponse<any>> {
    logger.debug(
      `${TUIRoomCoordinator.logPrefix}muteUserMicrophone userID: ${userID} mute: ${mute}`,
      this
    );
    try {
      const message = {
        cmd: ETUIRoomCoordinatorCommand.MuteUserMicrophone,
        room_id: this.roomID,
        receiver_id: userID,
        mute,
      };
      const tsResponse = await this.tsignalingService.invite(
        userID,
        message,
        TSignalingConfig.timeout
      );
      if (tsResponse.code === 0) {
        return TUIRoomResponse.success(tsResponse.data);
      }
      return TUIRoomResponse.fail(tsResponse.code, '', tsResponse.data);
    } catch (error: any) {
      throw TUIRoomError.error(
        TUIRoomErrorCode.SEND_CUSTOM_MESSAGE_ERROR,
        TUIRoomErrorMessage.SEND_CUSTOM_MESSAGE_ERROR
      );
    }
  }

  async muteAllUsersMicrophone(mute: boolean): Promise<TUIRoomResponse<any>> {
    logger.debug(
      `${TUIRoomCoordinator.logPrefix}muteAllUsersMicrophone mute: ${mute}`,
      this
    );
    try {
      await this.tim.updateGroupProfile({
        groupID: this.groupID,
        notification: JSON.stringify({
          ...this.state.roomInfo.roomConfig,
          isAllMicMuted: mute,
        }),
      });
      return TUIRoomResponse.success();
    } catch (error: any) {
      logger.error(
        `${TUIRoomCoordinator.logPrefix}muteAllUsersMicrophone error:`,
        error
      );
      throw TUIRoomError.error(
        TUIRoomErrorCode.CHANGE_ALL_MIC_MUTE_ERROR,
        TUIRoomErrorMessage.CHANGE_ALL_MIC_MUTE_ERROR
      );
    }
  }

  async muteUserCamera(
    userID: string,
    mute: boolean
  ): Promise<TUIRoomResponse<any>> {
    logger.debug(
      `${TUIRoomCoordinator.logPrefix}muteUserCamera userID: ${userID} mute: ${mute}`,
      this
    );
    return TUIRoomResponse.success();
  }

  async muteAllUsersCamera(mute: boolean): Promise<TUIRoomResponse<any>> {
    logger.debug(
      `${TUIRoomCoordinator.logPrefix}muteAllUsersCamera mute: ${mute}`,
      this
    );
    return TUIRoomResponse.success();
  }

  async muteChatRoom(mute: boolean): Promise<TUIRoomResponse<any>> {
    logger.debug(
      `${TUIRoomCoordinator.logPrefix}muteChatRoom mute: ${mute}`,
      this
    );
    return TUIRoomResponse.success();
  }

  async kickOffUser(userID: string): Promise<TUIRoomResponse<any>> {
    logger.debug(
      `${TUIRoomCoordinator.logPrefix}kickOffUser userID: ${userID}`,
      this
    );
    return TUIRoomResponse.success();
  }

  /**
   * 开始点名
   * @returns {Promise}
   */
  async startCallingRoll(): Promise<TUIRoomResponse<any>> {
    logger.debug(
      `${TUIRoomCoordinator.logPrefix}startCallingRoll`,
      this.state.roomInfo.roomConfig
    );
    if (this.state.roomInfo.roomConfig.isCallingRoll) {
      throw TUIRoomError.error(
        TUIRoomErrorCode.CALLING_ROLL,
        TUIRoomErrorMessage.CALLING_ROLL
      );
    }
    try {
      await this.setControlConfig({
        ...this.state.roomInfo.roomConfig,
        isCallingRoll: true,
      });
      return TUIRoomResponse.success();
    } catch (error: any) {
      logger.error(
        `${TUIRoomCoordinator.logPrefix}startCallingRoll error:`,
        error
      );
      throw TUIRoomError.error(
        TUIRoomErrorCode.START_CALL_ROLL_ERROR,
        TUIRoomErrorMessage.START_CALL_ROLL_ERROR
      );
    }
  }

  /**
   * 结束点名
   * @returns {Promise}
   */
  async stopCallingRoll(): Promise<TUIRoomResponse<any>> {
    logger.debug(
      `${TUIRoomCoordinator.logPrefix}stopCallingRoll`,
      this.state.roomInfo.roomConfig
    );
    if (!this.state.roomInfo.roomConfig.isCallingRoll) {
      throw TUIRoomError.error(
        TUIRoomErrorCode.NOT_CALL_ROLL,
        TUIRoomErrorMessage.NOT_CALL_ROLL
      );
    }
    try {
      await this.setControlConfig({
        ...this.state.roomInfo.roomConfig,
        isCallingRoll: false,
      });
      return TUIRoomResponse.success();
    } catch (error: any) {
      logger.error(
        `${TUIRoomCoordinator.logPrefix}stopCallingRoll error:`,
        error
      );
      throw TUIRoomError.error(
        TUIRoomErrorCode.STOP_CALL_ROLL_ERROR,
        TUIRoomErrorMessage.STOP_CALL_ROLL_ERROR
      );
    }
  }

  /**
   * 成员回复点名
   *
   * @return {Promise}
   */
  async replyCallingRoll(): Promise<TUIRoomResponse<any>> {
    logger.debug(
      `${TUIRoomCoordinator.logPrefix}replyCallingRoll`,
      this.state.roomInfo?.roomConfig
    );
    if (!this.state.roomInfo?.roomConfig?.isCallingRoll) {
      throw TUIRoomError.error(
        TUIRoomErrorCode.NOT_CALL_ROLL,
        TUIRoomErrorMessage.NOT_CALL_ROLL
      );
    }
    try {
      const message = {
        cmd: ETUIRoomCoordinatorCommand.ReplyCallingRoll,
        room_id: this.roomID,
        sender_id: this.state.currentUser.ID,
      };
      const imResponse = await this.tsignalingService.invite(
        this.state.roomInfo.ownerID,
        message
      );
      return TUIRoomResponse.success(imResponse.data);
    } catch (error) {
      throw TUIRoomError.error(
        TUIRoomErrorCode.SEND_CUSTOM_MESSAGE_ERROR,
        TUIRoomErrorMessage.SEND_CUSTOM_MESSAGE_ERROR
      );
    }
  }

  /**
   * 主持人邀请成员发言
   * @param {string} userID 成员ID
   * @returns {Promise}
   */
  async sendSpeechInvitation(userID: string): Promise<TUIRoomResponse<any>> {
    logger.debug(
      `${TUIRoomCoordinator.logPrefix}sendSpeechInvitation userID: ${userID}`,
      this
    );
    try {
      const message = {
        cmd: ETUIRoomCoordinatorCommand.SendSpeechInvitation,
        room_id: this.roomID,
        receiver_id: userID,
      };
      const tsResponse = await this.tsignalingService.invite(
        userID,
        message,
        TSignalingConfig.timeout
      );
      if (tsResponse.code === 0) {
        return TUIRoomResponse.success(tsResponse.data);
      }
      return TUIRoomResponse.fail(tsResponse.code, '', tsResponse.data);
    } catch (tsError) {
      throw TUIRoomError.error(
        TUIRoomErrorCode.SEND_CUSTOM_MESSAGE_ERROR,
        TUIRoomErrorMessage.SEND_CUSTOM_MESSAGE_ERROR
      );
    }
  }

  /**
   * 主持人取消发言邀请
   * @param {string} userID 成员ID
   * @returns {Promise}
   */
  async cancelSpeechInvitation(userID: string): Promise<TUIRoomResponse<any>> {
    logger.debug(
      `${TUIRoomCoordinator.logPrefix}cancelSpeechInvitation userID: ${userID}`,
      this
    );
    try {
      const message = {
        cmd: ETUIRoomCoordinatorCommand.SendSpeechInvitation,
        room_id: this.roomID,
        receiver_id: userID,
      };
      const imResponse = await this.tsignalingService.cancel(userID, message);
      return TUIRoomResponse.success(imResponse.data);
    } catch (error) {
      throw TUIRoomError.error(
        TUIRoomErrorCode.SEND_CUSTOM_MESSAGE_ERROR,
        TUIRoomErrorMessage.SEND_CUSTOM_MESSAGE_ERROR
      );
    }
  }

  /**
   * 成员响应发言邀请
   * @param {boolean} agree true: 接收邀请，false: 拒绝邀请
   * @returns {Promise}
   */
  async replySpeechInvitation(agree: boolean): Promise<TUIRoomResponse<any>> {
    logger.debug(
      `${TUIRoomCoordinator.logPrefix}replySpeechInvitation agree: ${agree}`,
      this
    );
    try {
      const message = {
        cmd: ETUIRoomCoordinatorCommand.SendSpeechInvitation,
        room_id: this.roomID,
        receiver_id: this.state.currentUser.ID,
      };
      let tsResponse = null;
      if (agree) {
        tsResponse = await this.tsignalingService.accept(
          this.state.roomInfo.ownerID,
          message
        );
      } else {
        tsResponse = await this.tsignalingService.reject(
          this.state.roomInfo.ownerID,
          message
        );
      }
      return TUIRoomResponse.success(tsResponse.data);
    } catch (error) {
      throw TUIRoomError.error(
        TUIRoomErrorCode.SEND_CUSTOM_MESSAGE_ERROR,
        TUIRoomErrorMessage.SEND_CUSTOM_MESSAGE_ERROR
      );
    }
  }

  async sendSpeechApplication(): Promise<TUIRoomResponse<any>> {
    logger.debug(`${TUIRoomCoordinator.logPrefix}sendSpeechApplication`, this);
    try {
      const message = {
        cmd: ETUIRoomCoordinatorCommand.SendSpeechApplication,
        room_id: this.roomID,
        sender_id: this.state.currentUser.ID,
      };
      const tsResponse = await this.tsignalingService.invite(
        this.state.roomInfo.ownerID,
        message,
        TSignalingConfig.timeout
      );
      if (tsResponse.code === 0) {
        return TUIRoomResponse.success(tsResponse.data);
      }
      return TUIRoomResponse.fail(tsResponse.code, '', tsResponse.data);
    } catch (error) {
      throw TUIRoomError.error(
        TUIRoomErrorCode.SEND_CUSTOM_MESSAGE_ERROR,
        TUIRoomErrorMessage.SEND_CUSTOM_MESSAGE_ERROR
      );
    }
  }

  async cancelSpeechApplication(): Promise<TUIRoomResponse<any>> {
    logger.debug(
      `${TUIRoomCoordinator.logPrefix}cancelSpeechApplication`,
      this
    );
    try {
      const message = {
        cmd: ETUIRoomCoordinatorCommand.SendSpeechApplication,
        room_id: this.roomID,
        sender_id: this.state.currentUser.ID,
      };
      const imResponse = await this.tsignalingService.cancel(
        this.state.currentUser.ID,
        message
      );
      return TUIRoomResponse.success(imResponse.data);
    } catch (error) {
      throw TUIRoomError.error(
        TUIRoomErrorCode.SEND_CUSTOM_MESSAGE_ERROR,
        TUIRoomErrorMessage.SEND_CUSTOM_MESSAGE_ERROR
      );
    }
  }

  async replySpeechApplication(
    userID: string,
    agree: boolean
  ): Promise<TUIRoomResponse<any>> {
    try {
      const message = {
        cmd: ETUIRoomCoordinatorCommand.SendSpeechApplication,
        room_id: this.roomID,
        sender_id: userID,
        agree,
      };
      let tsResponse = null;
      if (agree) {
        tsResponse = await this.tsignalingService.accept(userID, message);
      } else {
        tsResponse = await this.tsignalingService.reject(userID, message);
      }
      return TUIRoomResponse.success(tsResponse.data);
    } catch (error) {
      throw TUIRoomError.error(
        TUIRoomErrorCode.SEND_CUSTOM_MESSAGE_ERROR,
        TUIRoomErrorMessage.SEND_CUSTOM_MESSAGE_ERROR
      );
    }
  }

  async forbidSpeechApplication(
    forbid: boolean
  ): Promise<TUIRoomResponse<any>> {
    logger.debug(
      `${TUIRoomCoordinator.logPrefix}forbidSpeechApplication forbid: ${forbid}`,
      this
    );
    return TUIRoomResponse.success();
  }

  async sendOffSpeaker(userID: string): Promise<TUIRoomResponse<any>> {
    logger.debug(
      `${TUIRoomCoordinator.logPrefix}sendOffSpeaker userID: ${userID}`,
      this
    );
    return TUIRoomResponse.success();
  }

  async sendOffAllSpeakers(): Promise<TUIRoomResponse<any>> {
    logger.debug(`${TUIRoomCoordinator.logPrefix}sendOffAllSpeakers`, this);
    return TUIRoomResponse.success();
  }

  async exitSpeechState(): Promise<TUIRoomResponse<any>> {
    logger.debug(`${TUIRoomCoordinator.logPrefix}exitSpeechState`, this);
    return TUIRoomResponse.success();
  }

  /**
   * /////////////////////////////////////////////////////////////////////////////////
   * //
   * //                                   TIM 事件处理
   * //
   * /////////////////////////////////////////////////////////////////////////////////
   */

  // 事件绑定
  private bindTIMEvent() {
    this.tim.on(TIM.EVENT.MESSAGE_RECEIVED, this.onMessageReceived, this);
  }

  // 解除事件绑定
  private unbindTIMEvent() {
    this.tim.off(TIM.EVENT.MESSAGE_RECEIVED, this.onMessageReceived, this);
  }

  // 处理消息接收事件
  private onMessageReceived(event: Record<string, any>) {
    logger.log(
      `${TUIRoomCoordinator.logPrefix}onMessageReceived message:`,
      event
    );
    event.data.forEach((message: Record<string, any>) => {
      switch (message.type) {
        case TIM.TYPES.MSG_GRP_TIP:
          this.handleGroupTip(message);
          break;
        default:
          logger.warn(
            `${TUIRoomCoordinator.logPrefix}onMessageReceived ignored message:`,
            message
          );
      }
    });
  }

  // 处理群提示消息
  private handleGroupTip(message: Record<string, any>) {
    logger.log(
      `${TUIRoomCoordinator.logPrefix}handleGroupTip message:`,
      message
    );
    const { operationType } = message.payload;
    const notification = safelyParseJSON(
      message.payload.newGroupProfile.notification
    );
    switch (operationType) {
      case TIM.TYPES.GRP_TIP_GRP_PROFILE_UPDATED:
        // 收到群组资料变更
        this.handleGroupNotification(notification);
        break;
      default:
        logger.warn(
          `${TUIRoomCoordinator.logPrefix}handleGroupTip ignored notice:`,
          message
        );
    }
  }

  // 处理群组资料变更消息
  private handleGroupNotification(params: TTUIRoomConfig) {
    const notification = simpleClone(params);
    logger.log(
      `${TUIRoomCoordinator.logPrefix}handleGroupNotification message:`,
      notification
    );
    Object.keys(this.state.roomInfo.roomConfig).forEach((key) => {
      if (this.state.roomInfo.roomConfig[key] !== notification[key]) {
        switch (key) {
          case ETUIRoomCoordinatorConfig.isCallingRoll:
            this.emitter?.emit(
              notification[key]
                ? ETUIRoomEvents.onCallingRollStarted
                : ETUIRoomEvents.onCallingRollStopped,
              notification[key]
            );
            this.state.roomInfo.roomConfig[key] = notification[key];
            break;
          case ETUIRoomCoordinatorConfig.isAllMicMuted:
            logger.warn(
              `${TUIRoomCoordinator.logPrefix}.handleGroupProfileUpdate mute all`,
              notification[key]
            );
            this.state.roomInfo.roomConfig[key] = notification[key];
            if (this.state.currentUser.role !== ETUIRoomRole.MASTER) {
              this.emitter?.emit(
                ETUIRoomEvents.onMicrophoneMuted,
                notification[key]
              );
            }
            break;
          default:
            logger.warn(
              `${TUIRoomCoordinator.logPrefix}handleGroupNotification ignored notice:`,
              `${key}: ${notification[key]}`
            );
            break;
        }
      }
    });
  }

  /**
   * /////////////////////////////////////////////////////////////////////////////////
   * //
   * //                                   TSignaling 事件处理
   * //
   * /////////////////////////////////////////////////////////////////////////////////
   */
  // 事件绑定
  private bindTSignalingEvent() {
    this.tsignalingService.on(
      ETUIRoomEvents.onUserReplyCallingRoll,
      this.onUserReplyCallingRoll,
      this
    );
    this.tsignalingService.on(
      ETUIRoomEvents.onReceiveSpeechInvitation,
      this.onReceiveSpeechInvitation,
      this
    );
    this.tsignalingService.on(
      ETUIRoomEvents.onReceiveInvitationCancelled,
      this.onReceiveInvitationCancelled,
      this
    );
    this.tsignalingService.on(
      ETUIRoomEvents.onReceiveInvitationTimeout,
      this.onReceiveInvitationTimeout,
      this
    );
    this.tsignalingService.on(
      ETUIRoomEvents.onReceiveSpeechApplication,
      this.onReceiveSpeechApplication,
      this
    );
    this.tsignalingService.on(
      ETUIRoomEvents.onSpeechApplicationCancelled,
      this.onSpeechApplicationCancelled,
      this
    );
    this.tsignalingService.on(
      ETUIRoomEvents.onSpeechApplicationTimeout,
      this.onSpeechApplicationTimeout,
      this
    );
    this.tsignalingService.on(
      ETUIRoomEvents.onMicrophoneMuted,
      this.onMicrophoneMuted,
      this
    );
  }

  // 解除事件绑定
  private unbindTSignalingEvent() {
    this.tsignalingService.off(
      ETUIRoomEvents.onUserReplyCallingRoll,
      this.onUserReplyCallingRoll,
      this
    );
    this.tsignalingService.off(
      ETUIRoomEvents.onReceiveSpeechInvitation,
      this.onReceiveSpeechInvitation,
      this
    );
    this.tsignalingService.off(
      ETUIRoomEvents.onReceiveInvitationCancelled,
      this.onReceiveInvitationCancelled,
      this
    );
    this.tsignalingService.off(
      ETUIRoomEvents.onReceiveInvitationTimeout,
      this.onReceiveInvitationTimeout,
      this
    );
    this.tsignalingService.off(
      ETUIRoomEvents.onReceiveSpeechApplication,
      this.onReceiveSpeechApplication,
      this
    );
    this.tsignalingService.off(
      ETUIRoomEvents.onSpeechApplicationCancelled,
      this.onSpeechApplicationCancelled,
      this
    );
    this.tsignalingService.off(
      ETUIRoomEvents.onSpeechApplicationTimeout,
      this.onSpeechApplicationTimeout,
      this
    );
    this.tsignalingService.off(
      ETUIRoomEvents.onMicrophoneMuted,
      this.onMicrophoneMuted,
      this
    );
  }

  // 学生签到
  private async onUserReplyCallingRoll(event: TTUIRoomTSBase) {
    const {
      eventCode,
      data: { inviterID, type },
    } = event;
    logger.log(
      `${TUIRoomCoordinator.logPrefix}onUserReplyCallingRoll event:`,
      eventCode,
      inviterID,
      type
    );
    const message = {
      cmd: ETUIRoomCoordinatorCommand.ReplyCallingRoll,
      room_id: this.roomID,
      sender_id: this.state.currentUser.ID,
    };
    await this.tsignalingService.accept(inviterID, message);
    this.emitter?.emit(ETUIRoomEvents.onUserReplyCallingRoll, { inviterID });
  }

  // 邀请上台发言
  private async onReceiveSpeechInvitation(event: TTUIRoomTSBase) {
    const {
      eventCode,
      data: { inviterID, type },
    } = event;
    logger.log(
      `${TUIRoomCoordinator.logPrefix}onReceiveSpeechInvitation event:`,
      eventCode,
      inviterID,
      type
    );
    this.emitter?.emit(ETUIRoomEvents.onReceiveSpeechInvitation, inviterID);
  }

  // 取消邀请上台发言
  private async onReceiveInvitationCancelled(event: TTUIRoomTSBase) {
    const {
      eventCode,
      data: { inviterID, type },
    } = event;
    logger.log(
      `${TUIRoomCoordinator.logPrefix}onReceiveInvitationCancelled event:`,
      eventCode,
      inviterID,
      type
    );
    this.emitter?.emit(ETUIRoomEvents.onReceiveInvitationCancelled, inviterID);
  }

  private async onReceiveInvitationTimeout(event: TTUIRoomTSBase) {
    const {
      eventCode,
      data: { inviterID, type },
    } = event;
    logger.log(
      `${TUIRoomCoordinator.logPrefix}onReceiveInvitationTimeout event:`,
      eventCode,
      inviterID,
      type
    );
    this.emitter?.emit(ETUIRoomEvents.onReceiveInvitationTimeout, inviterID);
  }

  async onReceiveSpeechApplication(event: TTUIRoomTSBase) {
    const {
      eventCode,
      data: { inviterID, type },
    } = event;
    logger.log(
      `${TUIRoomCoordinator.logPrefix}onReceiveSpeechApplication event:`,
      eventCode,
      type,
      inviterID
    );
    this.emitter?.emit(ETUIRoomEvents.onReceiveSpeechApplication, inviterID);
  }

  async onSpeechApplicationCancelled(event: TTUIRoomTSBase) {
    const {
      eventCode,
      data: { inviterID, type },
    } = event;
    logger.log(
      `${TUIRoomCoordinator.logPrefix}onSpeechApplicationCancelled event:`,
      eventCode,
      type,
      inviterID
    );
    this.emitter?.emit(ETUIRoomEvents.onSpeechApplicationCancelled, inviterID);
  }

  async onSpeechApplicationTimeout(event: TTUIRoomTSBase) {
    const {
      eventCode,
      data: { inviterID, type },
    } = event;
    logger.log(
      `${TUIRoomCoordinator.logPrefix}onSpeechApplicationTimeout event:`,
      eventCode,
      inviterID,
      type
    );
    this.emitter?.emit(ETUIRoomEvents.onSpeechApplicationTimeout, inviterID);
  }

  private async onMicrophoneMuted(event: any) {
    const { eventCode, data } = event;
    logger.log(
      `${TUIRoomCoordinator.logPrefix}onMicrophoneMuted event:`,
      eventCode,
      data
    );
    const { mute, inviterID } = data;
    const message = {
      cmd: ETUIRoomCoordinatorCommand.MuteUserMicrophone,
      room_id: this.roomID,
      receiver_id: this.state.currentUser.ID,
      mute,
    };
    this.emitter?.emit(ETUIRoomEvents.onMicrophoneMuted, mute);
    await this.tsignalingService.accept(inviterID, message);
  }

  /**
   * 注册事件监听
   */
  on(
    eventName: string,
    handler: (...args: any) => void,
    ctx?: Record<string, any>
  ) {
    this.emitter?.on(eventName, handler, ctx);
  }

  /**
   * 取消事件监听
   */
  off(eventName: string, handler: (...args: any) => void) {
    this.emitter?.off(eventName as string, handler);
  }

  destroy() {
    this.groupID = '';
    this.roomID = '';
    this.state = null;
    this.tim = null;
    this.emitter = null;
    this.tsignalingService = null;
    this.unbindTSignalingEvent();
    this.unbindTIMEvent();
  }
}

export default TUIRoomCoordinator;
