import { createSlice } from '@reduxjs/toolkit';
import logger from '../../utils/logger';

const logPrefix = '[UserMapStore]';

export const userMapSlice = createSlice({
  name: 'userMap',
  initialState: {
    userMap: {} as Record<string, any>,
  },
  reducers: {
    addUser: (state, action) => {
      logger.log(`${logPrefix}addUser payload:`, action.payload);
      if (action.payload && action.payload.ID) {
        state.userMap[action.payload.ID] = action.payload;
      }
    },
    deleteUser: (state, action) => {
      logger.log(`${logPrefix}deleteUser payload:`, action.payload);
      if (action.payload && action.payload.ID) {
        delete state.userMap[action.payload.ID];
      }
    },
    updateUser: (state, action) => {
      logger.log(`${logPrefix}updateUser payload:`, action.payload);
      if (action.payload && action.payload.ID) {
        const old = state.userMap[action.payload.ID];
        if (old) {
          state.userMap[old.ID] = {
            ...old,
            ...action.payload,
          };
        }
      }
    },
  },
});

export const { addUser, deleteUser, updateUser } = userMapSlice.actions;

export default userMapSlice.reducer;
