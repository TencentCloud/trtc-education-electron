import { useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import a18n from 'a18n';
import {
  tuiRoomCore,
  ETUIRoomEvents,
  TUIRoomError,
} from '../../core/room-core';
import Toast from '../../components/toast';
import logger from '../../utils/logger';

function useTUIRoomErrorWarning() {
  const logPrefix = '[useTUIRoomErrorWarning]';
  const duration = 60 * 1000; // 60s

  const platform = useSelector((state: any) => state.user.platform);

  const onError = (error: TUIRoomError) => {
    logger.error(`${logPrefix}`, error);
    const { code, message } = error.data;
    Toast.error(`Error code:${code}, message: ${message}`, duration, () => {});
  };

  const onWarning = useCallback(
    (warning: TUIRoomError) => {
      logger.warn(`${logPrefix}`, warning);
      const { code, message } = warning.data;
      let userMessage = '';
      if (code === 1206 && platform === 'darwin') {
        userMessage = a18n('secutiry.mac.screenCapture.permission.notice');
      }
      Toast.warning(
        `Warning code:${code}, message: ${userMessage || message}`,
        duration,
        () => {}
      );
    },
    [platform]
  );

  useEffect(() => {
    tuiRoomCore.on(ETUIRoomEvents.onError, onError);
    return () => {
      tuiRoomCore.off(ETUIRoomEvents.onError, onError);
    };
  });

  useEffect(() => {
    tuiRoomCore.on(ETUIRoomEvents.onWarning, onWarning);
    return () => {
      tuiRoomCore.off(ETUIRoomEvents.onWarning, onWarning);
    };
  }, [onWarning]);
}

export default useTUIRoomErrorWarning;
