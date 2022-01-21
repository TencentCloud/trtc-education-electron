import React, { useEffect, useRef } from 'react';
import VideocamOffIcon from '@material-ui/icons/VideocamOff';
import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';
import IconButton from '@material-ui/core/IconButton';
import logger from '../../utils/logger';
import { tuiRoomCore, ETUIStreamType } from '../../core/room-core';
import './index.scss';

function CameraVideoPlayer(props: Record<string, any>) {
  const logPrefix = '[CameraVideoPlayer]';
  const { user, toggleMicMuteState } = props;
  const { userID, isCameraStarted, isMicStarted, isMicMuted, isLocal } = user;
  const ref = useRef(null);

  useEffect(() => {
    if (userID) {
      if (isCameraStarted) {
        if (ref.current) {
          if (isLocal) {
            logger.log(
              `${logPrefix}useEffect enter: startCameraPreview(${userID}, ...)`
            );
            tuiRoomCore.startCameraPreview(ref.current);
          } else {
            logger.log(
              `${logPrefix}useEffect enter: startRemoteView(${userID}, ...)`
            );
            tuiRoomCore.startRemoteView(
              userID,
              ref.current,
              ETUIStreamType.CAMERA
            );
          }
        } else {
          logger.error(
            `${logPrefix}useEffect error. Render view HTMLElement not exist`
          );
        }
      } else if (isLocal) {
        tuiRoomCore.stopCameraPreview();
      } else {
        logger.log(
          `${logPrefix}useEffect enter: stopRemoteView(${userID}, ...)`
        );
        tuiRoomCore.stopRemoteView(userID, ETUIStreamType.CAMERA);
      }
    }

    return () => {
      if (userID) {
        if (isCameraStarted) {
          if (isLocal) {
            logger.log(
              `${logPrefix}useEffect destroy: stopCameraPreview(${userID}, ...)`
            );
            tuiRoomCore.stopCameraPreview();
          } else {
            logger.log(
              `${logPrefix}useEffect destroy: stopRemoteView(${userID}, ...)`
            );
            tuiRoomCore.stopRemoteView(userID, ETUIStreamType.CAMERA);
          }
        }
      }
    };
  }, [userID, isLocal, isCameraStarted, ref]);

  return (
    <div className="trtc-edu-camera-video-player">
      {user && userID && (
        <>
          {isCameraStarted ? (
            <div className="video-content" ref={ref} />
          ) : (
            <div className="video-muted">
              <VideocamOffIcon />
            </div>
          )}
          <div className="video-op-bar" data-user-id={user.userID}>
            <div className="icon-group">
              <IconButton
                onClick={() => toggleMicMuteState(user)}
                className={`trtc-edu-icon-button ${
                  isMicStarted && !isMicMuted ? 'unmuted' : 'muted'
                }`}
              >
                {isMicStarted && !isMicMuted ? <MicIcon /> : <MicOffIcon />}
              </IconButton>
              <span className="user-info">{`${user.userID}`}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default CameraVideoPlayer;
