import TRTCCloud from 'trtc-electron-sdk';
import {
  TRTCParams,
  TRTCAppScene,
  TRTCVideoStreamType,
  TRTCScreenCaptureSourceType,
  TRTCVideoEncParam,
  Rect,
  TRTCAudioQuality,
  TRTCScreenCaptureSourceInfo,
  TRTCDeviceInfo,
  TRTCVideoQosPreference,
} from 'trtc-electron-sdk/liteav/trtc_define';
import logger from '../../utils/logger';
import { ETUIStreamType } from './types.d';
import TUIRoomError from './base/TUIRoomError';
import TUIRoomResponse from './base/TUIRoomResponse';
import { TUIRoomErrorCode, TUIRoomErrorMessage } from './constant';

type TTRTCEnterRoomParams = {
  SDKAppID: number;
  roomID: number;
  userID: string;
  userSig: string;
};

type ResolveRejectRecord = {
  resolve: (data: any) => void;
  reject: (data: any) => void;
};

const METHOD_NAME = {
  ENTER_ROOM: 'enterRoom',
  EXIT_ROOM: 'exitRoom',
};

class TRTCService {
  static logPrefix = '[TRTCService]';

  private SDKAppID = 0;

  private roomID = 0;

  private userID = '';

  private userSig = '';

  private isInRoom = false;

  private rtcCloud: TRTCCloud | null;

  private methodResolveRejectMap = new Map<
    string,
    Array<ResolveRejectRecord>
  >();

  constructor() {
    this.rtcCloud = TRTCCloud.getTRTCShareInstance();

    this.onEnterRoom = this.onEnterRoom.bind(this);
    this.onExitRoom = this.onExitRoom.bind(this);
    this.bindEvent();
  }

  /**
   * 统一的事件处理函数
   *
   * TRTC 的主动同步接口封装成 Promise 返回，在 TRTC 相应事件发生后，
   * 调用对应的 resolve 和 reject 方法。这个内部方法，用来根据方法名，
   * 集中调用存储在 methodResolveRejectMap 中的 resolve 或 reject 方法。
   * @param methodName
   * @param result
   */
  private invokeEventCallbacks(
    methodName: string,
    result: {
      isSuccess: boolean;
      data?: any;
    }
  ) {
    if (this.methodResolveRejectMap.has(methodName)) {
      const list = this.methodResolveRejectMap.get(methodName);
      if (list && list.length) {
        list.forEach(({ resolve, reject }) => {
          if (result.isSuccess) {
            resolve(TUIRoomResponse.success(result.data || null));
          } else {
            reject(TUIRoomError.error(result.data.code, result.data.message));
          }
        });
        this.methodResolveRejectMap.delete(methodName);
      }
    }
  }

  // TRTC onEnterRoom 事件处理方法
  private onEnterRoom(result: number) {
    logger.log(`${TRTCService.logPrefix}.onEnterRoom result: ${result}`);
    let responseData = null;
    if (result > 0) {
      responseData = {
        isSuccess: true,
        data: result,
      };
      this.isInRoom = true;
    } else {
      responseData = {
        isSuccess: false,
        data: {
          code: TUIRoomErrorCode.ENTER_ROOM_ERROR,
          message: TUIRoomErrorMessage.ENTER_ROOM_ERROR,
        },
      };
      this.isInRoom = false;
    }
    this.invokeEventCallbacks(METHOD_NAME.ENTER_ROOM, responseData);
  }

  // TRTC onExitRoom 事件处理方法
  private onExitRoom(reason: number) {
    logger.log(`${TRTCService.logPrefix}onExitRoom reason: ${reason}`);
    this.invokeEventCallbacks(METHOD_NAME.EXIT_ROOM, {
      isSuccess: true,
    });
    this.isInRoom = false;
  }

  private bindEvent() {
    this.rtcCloud?.on('onEnterRoom', this.onEnterRoom);
    this.rtcCloud?.on('onExitRoom', this.onExitRoom);
  }

  private unbindEvent() {
    this.rtcCloud?.off('onEnterRoom', this.onEnterRoom);
    this.rtcCloud?.off('onExitRoom', this.onExitRoom);
  }

  /**
   * /////////////////////////////////////////////////////////////////////////////////
   * //
   * //                                   进房、退房接口
   * //
   * /////////////////////////////////////////////////////////////////////////////////
   */

  public async enterRoom(
    params: TTRTCEnterRoomParams
  ): Promise<TUIRoomResponse<any>> {
    return new Promise((resolve, reject) => {
      const list =
        this.methodResolveRejectMap.get(METHOD_NAME.ENTER_ROOM) || [];
      list.push({
        resolve,
        reject,
      });
      this.methodResolveRejectMap.set(METHOD_NAME.ENTER_ROOM, list);

      this.innerRnterRoom(params);
    });
  }

  private innerRnterRoom(params: TTRTCEnterRoomParams) {
    if (!this.rtcCloud) {
      throw new TUIRoomError(
        TUIRoomErrorCode.TRTC_NOT_EXIST_ERROR,
        TUIRoomErrorMessage.TRTC_NOT_EXIST_ERROR
      );
    }

    const { SDKAppID, roomID, userID, userSig } = params;
    this.SDKAppID = SDKAppID;
    this.roomID = roomID;
    this.userID = userID;
    this.userSig = userSig;

    const param = new TRTCParams();
    param.sdkAppId = SDKAppID;
    param.roomId = roomID;
    param.userId = userID;
    param.userSig = userSig;
    param.userDefineRecordId = ''; // 云端录制
    this.rtcCloud.setDefaultStreamRecvMode(true, false); // 默认接收音频，不接收视频
    this.rtcCloud.enterRoom(param, TRTCAppScene.TRTCAppSceneVideoCall);

    this.rtcCloud.setRenderMode(2); // 1-webgl 2-yuvcanvs
  }

  public async exitRoom(): Promise<TUIRoomResponse<any>> {
    if (!this.isInRoom) {
      return TUIRoomResponse.success();
    }
    return new Promise((resolve, reject) => {
      const list = this.methodResolveRejectMap.get(METHOD_NAME.EXIT_ROOM) || [];
      list.push({
        resolve,
        reject,
      });
      this.methodResolveRejectMap.set(METHOD_NAME.EXIT_ROOM, list);

      this.innerExitRoom();
    });
  }

  private innerExitRoom() {
    if (!this.rtcCloud) {
      throw new TUIRoomError(
        TUIRoomErrorCode.TRTC_NOT_EXIST_ERROR,
        TUIRoomErrorMessage.TRTC_NOT_EXIST_ERROR
      );
    }

    this.rtcCloud.stopLocalPreview();
    this.rtcCloud.stopLocalAudio();
    this.rtcCloud.stopScreenCapture();
    this.rtcCloud.exitRoom();
  }

  /**
   * /////////////////////////////////////////////////////////////////////////////////
   * //
   * //                                   音视频相关接口
   * //
   * /////////////////////////////////////////////////////////////////////////////////
   */
  startCameraPreview(view: HTMLElement) {
    this.rtcCloud?.startLocalPreview(view);
  }

  stopCameraPreview() {
    this.rtcCloud?.stopLocalPreview();
  }

  startCameraDeviceTest(view: HTMLElement) {
    this.rtcCloud?.startCameraDeviceTest(view);
  }

  stopCameraDeviceTest() {
    this.rtcCloud?.stopCameraDeviceTest();
  }

  startMicrophone(quality?: TRTCAudioQuality) {
    this.rtcCloud?.startLocalAudio(quality);
  }

  stopMicrophone() {
    this.rtcCloud?.stopLocalAudio();
  }

  startMicrophoneTest(interval: number) {
    this.rtcCloud?.startMicDeviceTest(interval);
  }

  stopMicrophoneTest() {
    this.rtcCloud?.stopMicDeviceTest();
  }

  startSpeakerTest(testAudioFilePath: string) {
    this.rtcCloud?.startSpeakerDeviceTest(testAudioFilePath);
  }

  stopSpeakerTest() {
    this.rtcCloud?.stopSpeakerDeviceTest();
  }

  startSystemAudioLoopback() {
    this.rtcCloud?.startSystemAudioLoopback();
  }

  stopSystemAudioLoopback() {
    this.rtcCloud?.stopSystemAudioLoopback();
  }

  setVideoMirror(mirror: boolean) {
    this.rtcCloud?.setVideoEncoderMirror(mirror);
  }

  muteLocalCamera(mute: boolean) {
    this.rtcCloud?.muteLocalVideo(mute);
  }

  muteLocalMicrophone(mute: boolean) {
    this.rtcCloud?.muteLocalAudio(mute);
  }

  startRemoteView(
    userID: string,
    view: HTMLDivElement,
    streamType: ETUIStreamType
  ) {
    if (streamType === ETUIStreamType.CAMERA) {
      this.rtcCloud?.startRemoteView(
        userID,
        view,
        TRTCVideoStreamType.TRTCVideoStreamTypeBig
      );
    } else if (streamType === ETUIStreamType.SCREEN) {
      this.rtcCloud?.startRemoteView(
        userID,
        view,
        TRTCVideoStreamType.TRTCVideoStreamTypeSub
      );
    }
  }

  stopRemoteView(userID: string, streamType: ETUIStreamType) {
    if (streamType === ETUIStreamType.CAMERA) {
      this.rtcCloud?.stopRemoteView(
        userID,
        TRTCVideoStreamType.TRTCVideoStreamTypeBig
      );
    } else if (streamType === ETUIStreamType.SCREEN) {
      this.rtcCloud?.stopRemoteView(
        userID,
        TRTCVideoStreamType.TRTCVideoStreamTypeSub
      );
    }
  }

  muteRemoteCamera(userID: string, mute: boolean) {
    this.rtcCloud?.muteRemoteVideoStream(userID, mute);
  }

  muteRemoteAudio(userID: string, mute: boolean) {
    this.rtcCloud?.muteRemoteAudio(userID, mute);
  }

  enableAudioVolumeEvaluation(interval: number) {
    this.rtcCloud?.enableAudioVolumeEvaluation(interval);
  }

  setVideoQosPreference(preference: TRTCVideoQosPreference) {
    this.rtcCloud?.setNetworkQosParam(preference);
  }

  getCurrentSpeakerVolume() {
    this.rtcCloud?.getCurrentSpeakerVolume();
  }

  /**
   * /////////////////////////////////////////////////////////////////////////////////
   * //
   * //                                   屏幕分享相关接口
   * //
   * /////////////////////////////////////////////////////////////////////////////////
   */
  getScreenCaptureSources(
    thumbWidth: number,
    thumbHeight: number,
    iconWidth: number,
    iconHeight: number
  ): Array<TRTCScreenCaptureSourceInfo> {
    return this.rtcCloud?.getScreenCaptureSources(
      thumbWidth,
      thumbHeight,
      iconWidth,
      iconHeight
    );
  }

  selectScreenCaptureTarget(
    type: TRTCScreenCaptureSourceType,
    sourceId: string,
    sourceName: string,
    captureRect: Rect,
    captureMouse: boolean,
    highlightWindow: boolean
  ) {
    this.rtcCloud?.selectScreenCaptureTarget(
      type,
      sourceId,
      sourceName,
      captureRect,
      captureMouse,
      highlightWindow
    );
  }

  async startScreenCapture(
    view: HTMLDivElement | null,
    params?: TRTCVideoEncParam
  ): Promise<TUIRoomResponse<any>> {
    this.rtcCloud?.startScreenCapture(
      view,
      TRTCVideoStreamType.TRTCVideoStreamTypeSub,
      params || null
    );
    return TUIRoomResponse.success();
  }

  async pauseScreenCapture(): Promise<TUIRoomResponse<any>> {
    this.rtcCloud?.pauseScreenCapture();
    return TUIRoomResponse.success();
  }

  async resumeScreenCapture(): Promise<TUIRoomResponse<any>> {
    this.rtcCloud?.resumeScreenCapture();
    return TUIRoomResponse.success();
  }

  async stopScreenCapture(): Promise<TUIRoomResponse<any>> {
    this.rtcCloud?.stopScreenCapture();
    return TUIRoomResponse.success();
  }

  /**
   * /////////////////////////////////////////////////////////////////////////////////
   * //
   * //                                   设备管理相关接口
   * //
   * /////////////////////////////////////////////////////////////////////////////////
   */
  getMicrophoneList(): Array<TRTCDeviceInfo> {
    return this.rtcCloud?.getMicDevicesList();
  }

  getCurrentMicrophone(): TRTCDeviceInfo | null {
    return this.rtcCloud?.getCurrentMicDevice();
  }

  setCurrentMicrophone(deviceID: string) {
    this.rtcCloud?.setCurrentMicDevice(deviceID);
  }

  getCameraList(): Array<TRTCDeviceInfo> {
    return this.rtcCloud?.getCameraDevicesList();
  }

  getCurrentCamera(): TRTCDeviceInfo | null {
    return this.rtcCloud?.getCurrentCameraDevice();
  }

  setCurrentCamera(deviceID: string): void {
    this.rtcCloud?.setCurrentCameraDevice(deviceID);
  }

  getSpeakerList(): Array<TRTCDeviceInfo> {
    return this.rtcCloud?.getSpeakerDevicesList();
  }

  getCurrentSpeaker(): TRTCDeviceInfo | null {
    return this.rtcCloud?.getCurrentSpeakerDevice();
  }

  setCurrentSpeaker(deviceID: string) {
    this.rtcCloud?.setCurrentSpeakerDevice(deviceID);
  }

  /**
   * /////////////////////////////////////////////////////////////////////////////////
   * //
   * //                                    事件回调注册接口
   * //
   * /////////////////////////////////////////////////////////////////////////////////
   */
  on(eventName: string, handler: (...args: any) => void) {
    this.rtcCloud?.on(eventName, handler);
  }

  off(eventName: string, handler: (...args: any) => void) {
    this.rtcCloud?.off(eventName, handler);
  }

  /**
   * /////////////////////////////////////////////////////////////////////////////////
   * //
   * //                                    其他接口
   * //
   * /////////////////////////////////////////////////////////////////////////////////
   */

  getSDKVersion() {
    return this.rtcCloud?.getSDKVersion();
  }

  destroy() {
    this.unbindEvent();
    TRTCCloud.destroyTRTCShareInstance();
    this.rtcCloud = null;
    this.SDKAppID = 0;
    this.userSig = '';
    this.userID = '';
    this.roomID = 0;
    this.isInRoom = false;
  }
}

export default TRTCService;
