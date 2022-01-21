import React from 'react';
import SvgIcon, { SvgIconProps } from '@material-ui/core/SvgIcon';

function UnmuteAllIcon(props: SvgIconProps) {
  const newProps: SvgIconProps = {
    ...props,
    viewBox: '0 0 1024 1024',
  };
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <SvgIcon {...newProps}>
      <path
        d="M192 256
          a128,128 0 1,0 256,0
          a128,128 0 1,0 -256,0z
          M64 896
          c0,-256 128,-448 256,-448
          c128,0 256,192 256,448z
          M448 352
          a128,128 0 1,0 256,0
          a128,128 0 1,0 -256,0z
          M320 960
          c0,-256 128,-448 256,-448
          c128,0 256,192 256,448z
          M832 128 v-8
          a72,72 0 0,1 72,72 v256
          a72,72 0 0,1 -72,72
          v-16
          a56,56 0 0,0 56,-56 v-256
          a56,56 0 0,0 -56,-56 v-16z
          M832 128 v-8
          a72,72 0 0,0 -72,72 v256
          a72,72 0 0,0 72,72
          v-16
          a56,56 0 0,1 -56,-56 v-256
          a56,56 0 0,1 56,-56 v-16z
          M704 448
          h8 a120,120 0 1,0 240,0 h16
          a136,136 0 1,1 -272,0 h8z
          M832 576
          h8 v64 h64 v16 h-144 v-16 h64 v-64 h-8z"
      />
    </SvgIcon>
  );
}

export default UnmuteAllIcon;
