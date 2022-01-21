import logger from '../../utils/logger';
import TUIRoomResponse from './base/TUIRoomResponse';
import TUIRoomError from './base/TUIRoomError';
import { TUIRoomErrorCode, TUIRoomErrorMessage } from './constant';
import StateStore from './StateStore';
import TSignalingService from './TSignalingService';
import TRTCService from './TRTCService';

class TUIRoomAuthentication {
  static logPrefix = '[TUIRoomAuth]';

  private state: any;

  private tsignalingService: any;

  private trtcService: any;

  constructor(
    state: StateStore,
    tsignalingService: TSignalingService,
    trtcService: TRTCService
  ) {
    if (!state || !tsignalingService || !trtcService) {
      throw TUIRoomError.error(
        TUIRoomErrorCode.INVALID_PARAM_ERROR,
        TUIRoomErrorMessage.INVALID_PARAM_ERROR
      );
    }

    this.state = state;
    this.tsignalingService = tsignalingService;
    this.trtcService = trtcService;
  }

  async login(userID: string, userSig: string): Promise<TUIRoomResponse<any>> {
    logger.debug(
      `${TUIRoomAuthentication.logPrefix}.login userID: ${userID} userSig: ${userSig}`
    );
    const response = await this.tsignalingService.login(userID, userSig);
    this.state.currentUser.ID = userID;
    this.state.currentUser.isLocal = true;
    this.state.userMap.set(userID, this.state.currentUser);
    logger.debug(`${TUIRoomAuthentication.logPrefix}login result:`, response);
    return response;
  }

  /**
   * 退出登录
   * @returns {Promise}
   */
  async logout(): Promise<TUIRoomResponse<any>> {
    logger.debug(`${TUIRoomAuthentication.logPrefix}logout`);
    await this.trtcService.exitRoom();
    await this.tsignalingService.logout();
    return TUIRoomResponse.success();
  }

  destroy() {
    this.state = null;
    this.tsignalingService = null;
    this.trtcService = null;
  }
}

export default TUIRoomAuthentication;
