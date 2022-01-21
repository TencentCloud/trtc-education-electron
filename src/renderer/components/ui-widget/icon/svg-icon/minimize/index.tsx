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
      <path d="M207.075556 668.444444h568.888888v113.777778h-568.888888z" />
    </SvgIcon>
  );
}

export default MaximizeIcon;
