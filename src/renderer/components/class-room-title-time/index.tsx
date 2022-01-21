import React, { useEffect, useState } from 'react';
import logger from '../../utils/logger';

function ClassTime(props: any) {
  const { classStartTime } = props;
  const [second, setSecond] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [hour, setHour] = useState(0);

  useEffect(() => {
    logger.log('class-room-time useEffect classStartTime:', classStartTime);
    let timer: ReturnType<typeof setInterval> | null = null;
    if (classStartTime && classStartTime > 0) {
      timer = setInterval(() => {
        const currentTime = new Date().getTime();
        const diffTime = currentTime - classStartTime;
        const count = diffTime / 1000;
        const secondTime = parseInt((count % 60).toString(), 10);
        const minutesTime = parseInt(((count / 60) % 60).toString(), 10);
        const hourTime = parseInt((count / 60 / 60).toString(), 10);
        setHour(hourTime);
        setMinutes(minutesTime);
        setSecond(secondTime);
      }, 1000);
    }
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [classStartTime]);

  return (
    <span className="class-time">
      {hour > 9 ? hour : `0${hour}`}:{minutes > 9 ? minutes : `0${minutes}`}:
      {second > 9 ? second : `0${second}`}
    </span>
  );
}

export default ClassTime;
