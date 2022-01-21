import React, { useState, useRef, useEffect } from 'react';
import logger from '../../utils/logger';
import CameraVideoPlayer from '../camera-video-player';
import './index.scss';

const VIDEO_HEIGHT = 150;

interface VerticalVideoListProps {
  userList?: Array<Record<string, any>>;
  toggleMicMuteState: (user: Record<string, any>) => void;
}

function VerticalVideoList(props: VerticalVideoListProps) {
  const logPrefix = '[VideoList]';
  logger.log(`${logPrefix} props: `, props);

  const { userList, toggleMicMuteState } = props;
  const videoListEl = useRef<HTMLDivElement | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(0);
  const [visibleStartIndex, setVisibleStartIndex] = useState<number>(0);

  const updateVisibleVideos = (args: {
    offsetHeight: number;
    scrollHeight: number;
    scrollTop: number;
  }) => {
    logger.log(`${logPrefix}.updateVisibleVideos args:`, args);
    const { offsetHeight, scrollTop } = args;
    const newVisibleCount = Math.ceil(offsetHeight / VIDEO_HEIGHT);
    setVisibleCount(newVisibleCount);
    const newVisibleStartIndex = Math.floor(scrollTop / VIDEO_HEIGHT);
    setVisibleStartIndex(newVisibleStartIndex);
  };

  // As scrolling event will occur frequently, it is a best practice
  // to use requestAnimationFrame, setTimout or setInterval to throttle
  // the event handler execution(especial when doing DOM operation).
  let ticking = false;
  const onScrollList = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    logger.log(`${logPrefix}.onScrollList event:`, event, target.scrollTop);
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateVisibleVideos({
          offsetHeight: target.offsetHeight,
          scrollHeight: target.scrollHeight,
          scrollTop: target.scrollTop,
        });
        ticking = false;
      });
      ticking = true;
    }
  };

  useEffect(() => {
    if (videoListEl && videoListEl.current) {
      const { offsetHeight, scrollTop } = videoListEl.current;
      const newVisibleCount = Math.ceil(offsetHeight / VIDEO_HEIGHT);
      setVisibleCount(newVisibleCount);
      const newVisibleStartIndex = Math.floor(scrollTop / VIDEO_HEIGHT);
      setVisibleStartIndex(newVisibleStartIndex);
    }
  }, [videoListEl]);

  logger.log(
    `${logPrefix} visibleCount: ${visibleCount} visibleStartIndex: ${visibleStartIndex}`
  );
  const processedUserList = userList?.map((item, index) => {
    if (
      (index < visibleStartIndex || index > visibleStartIndex + visibleCount) &&
      !item.isLocal
    ) {
      return {
        ...item,
        isCameraStarted: false,
      };
    }
    return { ...item };
  });
  logger.log(`${logPrefix} processedUserList:`, processedUserList);

  return (
    <div
      className="video-list-content vertical-video-list"
      onScroll={onScrollList}
      ref={videoListEl}
    >
      {processedUserList &&
        processedUserList.length > 0 &&
        processedUserList.map((user: Record<string, any>) => {
          return (
            <CameraVideoPlayer
              key={user.userID}
              user={user}
              toggleMicMuteState={toggleMicMuteState}
            />
          );
        })}
    </div>
  );
}

VerticalVideoList.defaultProps = {
  userList: [],
};

export default VerticalVideoList;
