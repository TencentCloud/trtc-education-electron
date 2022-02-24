import { createSlice } from '@reduxjs/toolkit';
import logger from '../../utils/logger';

const prelog = '[CurrentUserStore]';

export const userSlice = createSlice({
  name: 'user',
  initialState: {
    roomID: Math.floor(Math.random() * 10000000).toString(),
    userID: '',
    role: 'teacher',
    isCameraStarted: true,
    isMicStarted: true,
    isMicMuted: false,
    currentCamera: {},
    currentMic: {},
    currentSpeaker: {},
    sharingScreenInfo: {},
    isAllStudentMuted: false,
    platform: '',
    classStartTime: 0,
    callRollTime: 0,
    isRolled: false,
    isLocal: true,
    isMutedByTeacher: false,
    isHandUpConfirmed: false,
    name: '',
    isLogin: false,
    classType: 'education',
    chatNumber: '695855795',
  },
  reducers: {
    initCurrentUserStore: (state, action) => {
      logger.debug(`${prelog}.initCurrentUserStore payload:`, action.payload);
      if (action.payload) {
        /* eslint-disable */
        state.roomID = action.payload.roomID !== undefined ? action.payload.roomID : state.roomID;
        state.userID = action.payload.userID !== undefined ? action.payload.userID : state.userID;
        state.role = action.payload.role !== undefined ? action.payload.role : state.role;
        state.isCameraStarted = action.payload.isCameraStarted !== undefined ? action.payload.isCameraStarted : state.isCameraStarted;
        state.isMicStarted = action.payload.isMicStarted !== undefined ? action.payload.isMicStarted : state.isMicStarted;
        state.isMicMuted = action.payload.isMicMuted !== undefined ? action.payload.isMicMuted : state.isMicMuted;
        state.currentCamera = action.payload.currentCamera !== undefined ? action.payload.currentCamera : state.currentCamera;
        state.currentMic = action.payload.currentMic !== undefined ? action.payload.currentMic : state.currentMic;
        state.currentSpeaker = action.payload.currentSpeaker !== undefined ? action.payload.currentSpeaker : state.currentSpeaker;
        state.sharingScreenInfo = action.payload.sharingScreenInfo !== undefined ? action.payload.sharingScreenInfo : state.sharingScreenInfo;
        state.isAllStudentMuted = action.payload.isAllStudentMuted !== undefined ? action.payload.isAllStudentMuted : state.isAllStudentMuted;
        state.platform = action.payload.platform !== undefined ? action.payload.platform : state.platform;
        state.classStartTime = action.payload.classStartTime !== undefined ? action.payload.classStartTime : state.classStartTime;
        state.callRollTime = action.payload.callRollTime !== undefined ? action.payload.callRollTime : state.callRollTime;
        state.isRolled = action.payload.isRolled !== undefined ? action.payload.isRolled : state.isRolled;
        state.isLocal = action.payload.isLocal !== undefined ? action.payload.isLocal : state.isLocal;
        state.isMutedByTeacher = action.payload.isMutedByTeacher !== undefined ? action.payload.isMutedByTeacher : state.isMutedByTeacher;
        state.isHandUpConfirmed = action.payload.isHandUpConfirmed !== undefined ? action.payload.isHandUpConfirmed : state.isHandUpConfirmed;
        state.name = action.payload.name !== undefined ? action.payload.name : state.name;
        state.isLogin = action.payload.isLogin !== undefined ? action.payload.isLogin : state.isLogin;
        state.classType = action.payload.classType !== undefined ? action.payload.classType : state.classType;
        /* eslint-enable */
      }
    },
    toggleLogin: (state, action) => {
      state.isLogin = action.payload || false;
    },
    updateName: (state, action) => {
      if (action.payload !== undefined) {
        state.name = action.payload || '';
        state.userID = action.payload || '';
      }
    },
    updateUserID: (state, action) => {
      if (action.payload !== undefined) {
        state.name = action.payload || '';
        state.userID = action.payload || '';
      }
    },
    updateRole: (state, action) => {
      if (action.payload !== undefined) {
        state.role = action.payload;
      }
    },
    updateRoomID: (state, action) => {
      if (action.payload !== undefined) {
        state.roomID = action.payload;
      }
    },
    updateClassType: (state, action) => {
      if (action.payload !== undefined) {
        state.classType = action.payload;
      }
    },
    updateDeviceState: (state, action) => {
      if (action.payload.isCameraStarted !== undefined) {
        state.isCameraStarted = action.payload.isCameraStarted;
      }
      if (action.payload.isMicStarted !== undefined) {
        state.isMicStarted = action.payload.isMicStarted;
      }
      if (action.payload.isMicMuted !== undefined) {
        state.isMicMuted = action.payload.isMicMuted;
      }
    },
    updateCurrentDevice: (state, action) => {
      if (action.payload.currentCamera) {
        state.currentCamera = action.payload.currentCamera;
      }
      if (action.payload.currentMic) {
        state.currentMic = action.payload.currentMic;
      }
      if (action.payload.currentSpeaker) {
        state.currentSpeaker = action.payload.currentSpeaker;
      }
    },
    updateShareScreenInfo: (state, action) => {
      if (action.payload) {
        Object.entries(action.payload).forEach(([key, value]) => {
          // @ts-ignore
          state.sharingScreenInfo[key] = value;
        });
      }
    },
    updateAllStudentMuteState: (state, action) => {
      state.isAllStudentMuted = action.payload || false;
    },
    updateAllStudentRollState: (state, action) => {
      state.callRollTime = action.payload || 0;
    },
    updateRollState: (state, action) => {
      state.isRolled = action.payload || false;
    },
    updateIsMutedByTeacher: (state, action) => {
      state.isMutedByTeacher = action.payload || false;
      if (action.payload) {
        state.isHandUpConfirmed = false; // 被老师禁麦后，举手后被允许发言状态改成 false
      }
    },
    updateIsHandUpConfirmed: (state, action) => {
      state.isHandUpConfirmed = action.payload || false;
    },
    updatePlatform: (state, action) => {
      state.platform = action.payload || '';
    },
    updateClassStartTime: (state, action) => {
      state.classStartTime = action.payload || 0;
    },
  },
});

export const {
  initCurrentUserStore,
  toggleLogin,
  updateName,
  updateUserID,
  updateRole,
  updateRoomID,
  updateClassType,
  updateDeviceState,
  updateCurrentDevice,
  updateShareScreenInfo,
  updateAllStudentMuteState,
  updateIsMutedByTeacher,
  updateIsHandUpConfirmed,
  updatePlatform,
  updateClassStartTime,
  updateAllStudentRollState,
  updateRollState,
} = userSlice.actions;

export default userSlice.reducer;
