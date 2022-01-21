import { createSlice } from '@reduxjs/toolkit';
import logger from '../../utils/logger';

const prelog = '[RoomInfoStore]';

export const roomInfoSlice = createSlice({
  name: 'roomInfo',
  initialState: {
    ownerID: '',
    isAllCameraMuted: false,
    isAllMicMuted: false,
    isCallingRoll: false,
    isChatRoomMuted: false,
    isSpeechApplicationForbidden: false,
    speechMode: 'ApplySpeech',
    startTime: 0,
  },
  reducers: {
    initRoomInfoStore: (state, action) => {
      logger.log(`${prelog}.initCurrentUserStore payload:`, action.payload);
      if (action.payload) {
        /* eslint-disable */
        state.ownerID = action.payload.ownerID !== undefined ? action.payload.ownerID : state.ownerID;
        state.isAllCameraMuted = action.payload.isAllCameraMuted !== undefined ? action.payload.isAllCameraMuted : state.isAllCameraMuted;
        state.isAllMicMuted = action.payload.isAllMicMuted !== undefined ? action.payload.isAllMicMuted : state.isAllMicMuted;
        state.isCallingRoll = action.payload.isCallingRoll !== undefined ? action.payload.isCallingRoll : state.isCallingRoll;
        state.isChatRoomMuted = action.payload.isChatRoomMuted !== undefined ? action.payload.isChatRoomMuted : state.isChatRoomMuted;
        state.isSpeechApplicationForbidden = action.payload.isSpeechApplicationForbidden !== undefined ? action.payload.isSpeechApplicationForbidden : state.isSpeechApplicationForbidden;
        state.speechMode = action.payload.speechMode !== undefined ? action.payload.speechMode : state.speechMode;
        state.startTime = action.payload.startTime !== undefined ? action.payload.startTime : state.startTime;
        /* eslint-enable */
      }
    },
    updateOwnerID: (state, action) => {
      if (action.payload !== undefined) {
        state.ownerID = action.payload;
      }
    },
    updateIsAllCameraMuted: (state, action) => {
      if (action.payload !== undefined) {
        state.isAllCameraMuted = action.payload;
      }
    },
    updateIsAllMicrophoneMuted: (state, action) => {
      if (action.payload !== undefined) {
        state.isAllMicMuted = action.payload;
      }
    },
    updateIsCallingRoll: (state, action) => {
      state.isCallingRoll = action.payload || false;
    },
    updateIsChatRoomMuted: (state, action) => {
      state.isChatRoomMuted = action.payload || 0;
    },
    updateIsSpeechApplicationForbidden: (state, action) => {
      state.isSpeechApplicationForbidden = action.payload || false;
    },
    updateSpeechMode: (state, action) => {
      state.speechMode = action.payload || '';
    },
    updateStartTime: (state, action) => {
      state.startTime = action.payload || 0;
    },
  },
});

export const {
  initRoomInfoStore,
  updateOwnerID,
  updateIsAllCameraMuted,
  updateIsAllMicrophoneMuted,
  updateIsCallingRoll,
  updateIsChatRoomMuted,
  updateIsSpeechApplicationForbidden,
  updateSpeechMode,
  updateStartTime,
} = roomInfoSlice.actions;

export default roomInfoSlice.reducer;
