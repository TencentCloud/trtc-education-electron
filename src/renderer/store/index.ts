import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import userReducer from './user/userSlice';
import roomReducer from './room-info/roomInfoSlice';
import envReducer from './env/envSlice';
import messageReducer from './message/messageSlice';
import userMapReducer from './user-map/userMapSlice';
import deviceReducer from './device/deviceSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    env: envReducer,
    message: messageReducer,
    roomInfo: roomReducer,
    userMap: userMapReducer,
    device: deviceReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
