import { createSlice } from '@reduxjs/toolkit';
import logger from '../../utils/logger';

const logPrefix = '[EnvStore]';

export const envSlice = createSlice({
  name: 'env',
  initialState: {
    currentWindowID: '',
    windowBaseInfoMap: {},
    isProd: process.env.NODE_ENV === 'production',
  },
  reducers: {
    initEnvStore: (state, action) => {
      logger.log(`${logPrefix}.initEnvStore payload:`, action.payload);
      const { currentWindowID, windowBaseInfoMap } = action.payload;
      state.currentWindowID = currentWindowID;
      state.windowBaseInfoMap = windowBaseInfoMap;
    },
    updateCurrentWindowID: (state, action) => {
      state.currentWindowID = action.payload;
    },
    updateWindowBaseInfoMap: (state, action) => {
      state.windowBaseInfoMap = action.payload;
    },
  },
});

export const { initEnvStore, updateCurrentWindowID, updateWindowBaseInfoMap } =
  envSlice.actions;

export default envSlice.reducer;
