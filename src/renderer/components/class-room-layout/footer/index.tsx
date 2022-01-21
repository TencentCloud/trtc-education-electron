import React from 'react';
import './index.scss';

function FootContainer(props: Record<string, any>) {
  const { children } = props;

  return <div className="trtc-edu-foot-container">{children}</div>;
}

export default FootContainer;
