import React from 'react';
import SvgIcon, { SvgIconProps } from '@material-ui/core/SvgIcon';

function RecorderIcon(props: SvgIconProps) {
  const newProps: SvgIconProps = {
    ...props,
    viewBox: '0 0 1024 1024',
  };
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <SvgIcon {...newProps}>
      <path d="M512 85.333333a426.666667 426.666667 0 1 0 426.666667 426.666667A426.666667 426.666667 0 0 0 512 85.333333z m0 768a341.333333 341.333333 0 1 1 341.333333-341.333333 341.333333 341.333333 0 0 1-341.333333 341.333333z m0-597.333333a256 256 0 1 0 256 256 256 256 0 0 0-256-256z m0 426.666667a170.666667 170.666667 0 1 1 170.666667-170.666667 170.666667 170.666667 0 0 1-170.666667 170.666667z" />
    </SvgIcon>
  );
}

export default RecorderIcon;
