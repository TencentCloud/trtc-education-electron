import { createSlice } from '@reduxjs/toolkit';
import logger from '../../utils/logger';

const logPrefix = '[MessageStore]';

export const messageSlice = createSlice({
  name: 'message',
  initialState: {
    messages: [] as Array<any>,
  },
  reducers: {
    addMessage: (state, action) => {
      if (action.payload) {
        state.messages.push(action.payload);
      }
    },
  },
});

export const { addMessage } = messageSlice.actions;

export default messageSlice.reducer;
