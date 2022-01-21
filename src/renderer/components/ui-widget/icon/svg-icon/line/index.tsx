import React from 'react';
import SvgIcon, { SvgIconProps } from '@material-ui/core/SvgIcon';

function LineIcon(props: SvgIconProps) {
  const newProps: SvgIconProps = {
    ...props,
    viewBox: '0 0 24 24',
  };
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <SvgIcon {...newProps}>
      <path d="M5 3 L21 19 L19 21 L3 5z" />
    </SvgIcon>
  );
}

export default LineIcon;
