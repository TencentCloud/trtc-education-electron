import React from 'react';
import SvgIcon, { SvgIconProps } from '@material-ui/core/SvgIcon';

function MaximizeIcon(props: SvgIconProps) {
  const newProps: SvgIconProps = {
    ...props,
    viewBox: '0 0 1024 1024',
  };
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <SvgIcon {...newProps}>
      <path d="M128.576377 895.420553 128.576377 128.578424l766.846222 0 0 766.842129L128.576377 895.420553zM799.567461 224.434585 224.432539 224.434585l0 575.134923 575.134923 0L799.567461 224.434585z" />
    </SvgIcon>
  );
}

export default MaximizeIcon;
