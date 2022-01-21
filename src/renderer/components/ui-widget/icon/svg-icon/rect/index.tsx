import React from 'react';
import SvgIcon, { SvgIconProps } from '@material-ui/core/SvgIcon';

function RectIcon(props: SvgIconProps) {
  const newProps: SvgIconProps = {
    ...props,
    viewBox: '0 0 24 24',
  };
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <SvgIcon {...newProps}>
      <path d="M4 6 h16v12h-16Z" />
    </SvgIcon>
  );
}

export default RectIcon;
