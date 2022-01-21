import React from 'react';
import SvgIcon, { SvgIconProps } from '@material-ui/core/SvgIcon';

function PointerMouseIcon(props: SvgIconProps) {
  const newProps: SvgIconProps = {
    ...props,
    viewBox: '0 0 1024 1024',
  };
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <SvgIcon {...newProps}>
      <path d="M793.714286 596q17.714286 17.142857 8 39.428571-9.714286 22.857143-33.714286 22.857143H549.714286l114.857143 272q5.714286 14.285714 0 28t-19.428572 20l-101.142857 42.857143q-14.285714 5.714286-28 0t-20-19.428571l-109.142857-258.285715-178.285714 178.285715q-10.857143 10.857143-25.714286 10.857143-6.857143 0-13.714286-2.857143-22.857143-9.714286-22.857143-33.714286V36.571429q0-24 22.857143-33.714286 6.857143-2.857143 13.714286-2.857143 15.428571 0 25.714286 10.857143z" />
    </SvgIcon>
  );
}

export default PointerMouseIcon;
