import { createSlice } from '@reduxjs/toolkit';
import { TRTCDeviceInfo } from 'trtc-electron-sdk/liteav/trtc_define';
import logger from '../../utils/logger';

const logPrefix = '[DeviceStore]';

export const deviceSlice = createSlice({
  name: 'device',
  initialState: {
    cameraList: [] as Array<TRTCDeviceInfo>,
    microphoneList: [] as Array<TRTCDeviceInfo>,
    speakerList: [] as Array<TRTCDeviceInfo>,
  },
  reducers: {
    initDeviceStore: (state, action) => {
      logger.debug(`${logPrefix}initDeviceStore:`, action.payload);
      if (action.payload) {
        const { cameraList, microphoneList, speakerList } = action.payload;
        state.cameraList = cameraList || [];
        state.microphoneList = microphoneList || [];
        state.speakerList = speakerList || [];
      }
    },
  },
});

export const { initDeviceStore } = deviceSlice.actions;

export default deviceSlice.reducer;
