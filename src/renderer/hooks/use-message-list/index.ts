import { useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { addMessage } from '../../store/message/messageSlice';
import logger from '../../utils/logger';
import { tuiRoomCore, ETUIRoomEvents } from '../../core/room-core';

function useMessageList() {
  const logPrefix = '[useMessageList]';

  const dispatch = useDispatch();

  const sendChatMessage = async (text: string) => {
    const tuiResponse = await tuiRoomCore.sendChatMessage(text);
    logger.log(`${logPrefix}sendChatMessage response:`, tuiResponse);
    const { code, data: message } = tuiResponse;
    if (code === 0) {
      dispatch(addMessage(message));
    }
  };

  const onReceivedChatMessage = useCallback(
    (event: Record<string, any>) => {
      logger.log(`${logPrefix}onReceivedChatMessage message:`, event);
      const { data: message } = event;
      dispatch(addMessage(message));
    },
    [dispatch]
  );

  useEffect(() => {
    tuiRoomCore.on(ETUIRoomEvents.onReceiveChatMessage, onReceivedChatMessage);
    return () => {
      tuiRoomCore.off(
        ETUIRoomEvents.onReceiveChatMessage,
        onReceivedChatMessage
      );
    };
  }, [onReceivedChatMessage]);

  return {
    sendChatMessage,
  };
}

export default useMessageList;
