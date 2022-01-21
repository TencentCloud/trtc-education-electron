import React, { useState, useRef, useEffect, useCallback } from 'react';
import IconButton from '@material-ui/core/IconButton';
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import CameraVideoPlayer from '../camera-video-player';
import logger from '../../utils/logger';

const VIDEO_WIDTH = 160;

interface HorizontalVideoListProps {
  userList?: Array<Record<string, any>>;
  toggleMicMuteState: (user: Record<string, any>) => void;
}

function HorizontalVideoList(props: HorizontalVideoListProps) {
  const logPrefix = '[HorizontalVideoList]';

  const { userList, toggleMicMuteState } = props;
  const videoListEl = useRef<HTMLDivElement | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(0);
  const [visibleStartIndex, setVisibleStartIndex] = useState<number>(0);

  useEffect(() => {
    if (videoListEl && videoListEl.current) {
      const containerWidth = videoListEl.current.parentElement?.offsetWidth;
      if (containerWidth) {
        const newVisibleCount = Math.floor(containerWidth / VIDEO_WIDTH);
        logger.log(
          `${logPrefix}.useEffect newVisibleCount: ${newVisibleCount}`
        );
        setVisibleCount(newVisibleCount);
      }
    }
  }, [videoListEl]);

  const goLeft = useCallback(() => {
    if (visibleStartIndex >= 1) {
      setVisibleStartIndex(visibleStartIndex - 1);
    }
  }, [visibleStartIndex]);

  const goRight = useCallback(() => {
    if (userList) {
      if (userList.length > visibleStartIndex + visibleCount) {
        setVisibleStartIndex(visibleStartIndex + 1);
      }
    }
  }, [userList, visibleStartIndex, visibleCount]);

  return (
    <div className="video-list-content horizontal-video-list" ref={videoListEl}>
      {userList &&
        userList.length > 0 &&
        userList
          .slice(visibleStartIndex, visibleStartIndex + visibleCount)
          .map((user: Record<string, any>) => {
            return (
              <CameraVideoPlayer
                key={user.userID}
                user={user}
                toggleMicMuteState={toggleMicMuteState}
              />
            );
          })}
      {userList && userList.length > visibleCount && (
        <>
          <IconButton className="btn-go-left" onClick={goLeft}>
            <KeyboardArrowLeftIcon />
          </IconButton>
          <IconButton className="btn-go-right" onClick={goRight}>
            <KeyboardArrowRightIcon />
          </IconButton>
        </>
      )}
    </div>
  );
}

HorizontalVideoList.defaultProps = {
  userList: [],
};

export default HorizontalVideoList;
