import logger from '../../utils/logger';
import { safelyParseJSON, simpleClone } from './util';
import { ETUISpeechMode, ETUIRoomRole } from './types.d';
import TUIRoomResponse from './base/TUIRoomResponse';
import TUIRoomError from './base/TUIRoomError';
import TUIRoomInfo from './base/TUIRoomInfo';
import TUIRoomUser from './base/TUIRoomUser';
import { TUIRoomErrorCode, TUIRoomErrorMessage } from './constant';
import TIMService from './TIMService';
import TRTCService from './TRTCService';
import StateStore from './StateStore';

class TUIRoomLifecycle {
  static logPrefix = '[TUIRoomLifecycle]';

  private state: any;

  private timService: any;

  private trtcService: any;

  constructor(
    state: StateStore,
    timService: TIMService,
    trtcService: TRTCService
  ) {
    if (!state || !timService || !trtcService) {
      throw TUIRoomError.error(
        TUIRoomErrorCode.INVALID_PARAM_ERROR,
        TUIRoomErrorMessage.INVALID_PARAM_ERROR
      );
    }
    this.state = state;
    this.timService = timService;
    this.trtcService = trtcService;
  }

  async createRoom(options: {
    SDKAppID: number;
    userID: string;
    userSig: string;
    roomID: string;
    mode: ETUISpeechMode;
  }): Promise<
    TUIRoomResponse<{
      room: TUIRoomInfo;
      user: TUIRoomUser;
    }>
  > {
    logger.debug(`${TUIRoomLifecycle.logPrefix}createRoom options:`, options);
    const { SDKAppID, userID, userSig, roomID, mode } = options;
    try {
      // 设置开始时间
      this.state.roomInfo.roomConfig.startTime = new Date().getTime();
      // 新建 IM 群
      const timResponse = await this.timService.createGroup(
        roomID,
        this.state.roomInfo.roomConfig
      );
      const { data: groupInfo } = timResponse;
      logger.debug(
        `${TUIRoomLifecycle.logPrefix}createRoom createGroup response:`,
        groupInfo
      );
      // 进入 TRTC 房间
      await this.trtcService.enterRoom({
        SDKAppID,
        userID,
        userSig,
        roomID: parseInt(roomID, 10),
      });
      this.trtcService.startMicrophone();
      this.state.roomInfo.roomID = roomID;
      this.state.roomInfo.ownerID = groupInfo.ownerID;
      this.state.currentUser.role = ETUIRoomRole.MASTER;

      return TUIRoomResponse.success(
        simpleClone({
          room: this.state.roomInfo,
          user: this.state.currentUser,
        })
      );
    } catch (error: any) {
      if (error instanceof TUIRoomError) {
        throw error;
      } else {
        logger.error(`${TUIRoomLifecycle.logPrefix}createRoom error:`, error);
        throw TUIRoomError.error(
          TUIRoomErrorCode.CREATE_ROOM_ERROR,
          TUIRoomErrorMessage.CREATE_ROOM_ERROR
        );
      }
    }
  }

  async enterRoom(options: {
    SDKAppID: number;
    userID: string;
    userSig: string;
    roomID: string;
  }): Promise<
    TUIRoomResponse<{
      room: TUIRoomInfo;
      user: TUIRoomUser;
    }>
  > {
    logger.debug(`${TUIRoomLifecycle.logPrefix}enterRoom options:`, options);
    const { SDKAppID, userID, userSig, roomID } = options;
    try {
      // 加入 IM 群
      const timResponse = await this.timService.joinGroup(roomID);
      const { data: groupInfo } = timResponse;
      logger.debug(
        `${TUIRoomLifecycle.logPrefix}enterRoom joinGroup:`,
        groupInfo
      );
      // 提取房间控制参数（通过IM群公告实现）
      if (groupInfo.notification) {
        try {
          this.state.roomInfo.roomConfig = {
            ...this.state.roomInfo.roomConfig,
            ...safelyParseJSON(groupInfo.notification),
          };
        } catch (error: any) {
          logger.error(
            `${TUIRoomLifecycle.logPrefix}enterRoom parse group notification error:`,
            groupInfo.notification
          );
        }
      }
      // 进入 TRTC 房间
      await this.trtcService.enterRoom({
        SDKAppID,
        userID,
        userSig,
        roomID: parseInt(roomID, 10),
      });
      this.trtcService.startMicrophone();
      this.state.roomInfo.roomID = roomID;
      this.state.roomInfo.ownerID = groupInfo.ownerID;
      this.state.currentUser.role = ETUIRoomRole.ANCHOR;

      return TUIRoomResponse.success(
        simpleClone({
          room: this.state.roomInfo,
          user: this.state.currentUser,
        })
      );
    } catch (error: any) {
      if (error instanceof TUIRoomError) {
        throw error;
      } else {
        logger.error(`${TUIRoomLifecycle.logPrefix}enterRoom error:`, error);
        throw TUIRoomError.error(
          TUIRoomErrorCode.ENTER_ROOM_ERROR,
          TUIRoomErrorMessage.ENTER_ROOM_ERROR
        );
      }
    }
  }

  async exitRoom(): Promise<
    TUIRoomResponse<{
      room: TUIRoomInfo;
      user: TUIRoomUser;
    }>
  > {
    logger.debug(`${TUIRoomLifecycle.logPrefix}exitRoom`);
    try {
      await this.trtcService.exitRoom();
      await this.timService.quitGroup();

      const responseData = simpleClone({
        room: this.state.roomInfo,
        user: this.state.currentUser,
      });
      this.state.roomInfo.reset();
      this.state.currentUser.reset();

      return TUIRoomResponse.success(responseData);
    } catch (error: any) {
      if (error instanceof TUIRoomError) {
        throw error;
      } else {
        logger.error(`${TUIRoomLifecycle.logPrefix}exitRoom error:`, error);
        throw TUIRoomError.error(
          TUIRoomErrorCode.EXIT_ROOM_ERROR,
          TUIRoomErrorMessage.EXIT_ROOM_ERROR
        );
      }
    }
  }

  async destroyRoom(): Promise<
    TUIRoomResponse<{
      room: TUIRoomInfo;
      user: TUIRoomUser;
    }>
  > {
    logger.debug(`${TUIRoomResponse}destroyRoom`);
    // 检查当前用户是否有权限销毁房间
    if (
      this.state.currentUser.role !== ETUIRoomRole.MANAGER &&
      this.state.currentUser.role !== ETUIRoomRole.MASTER
    ) {
      throw TUIRoomError.error(
        TUIRoomErrorCode.NO_PRIVILEGE,
        TUIRoomErrorMessage.NO_PRIVILEGE
      );
    }
    try {
      await this.trtcService.exitRoom();
      await this.timService.dismissGroup();

      const responseData = simpleClone({
        room: this.state.roomInfo,
        user: this.state.currentUser,
      });
      this.state.roomInfo.reset();
      this.state.currentUser.reset();

      return TUIRoomResponse.success(responseData);
    } catch (error: any) {
      if (error instanceof TUIRoomError) {
        throw error;
      } else {
        logger.error(`${TUIRoomLifecycle.logPrefix}destroyRoom error:`, error);
        throw TUIRoomError.error(
          TUIRoomErrorCode.DESTROY_ROOM_ERROR,
          TUIRoomErrorMessage.DESTROY_ROOM_ERROR
        );
      }
    }
  }

  public destroy() {
    this.state = null;
    this.timService = null;
    this.trtcService = null;
  }
}

export default TUIRoomLifecycle;
