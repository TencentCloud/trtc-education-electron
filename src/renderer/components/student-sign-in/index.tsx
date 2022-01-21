import React from 'react';
import logger from '../../utils/logger';
import './index.scss';

function StudentSignIn(props: any) {
  const { signOn } = props;
  const logPrefix = 'StudentSignIn';

  logger.log(`${logPrefix}.callingRollStatus:`);

  return (
    <div className="sign-in" onClick={signOn}>
      {' '}
      签到
    </div>
  );
}

export default StudentSignIn;
