import React, { useEffect } from 'react';
import './index.scss';

interface ButtonProps {
  type: string;
  onClick: () => void;
  className: string;
  children: React.ReactNode | null;
}
function Button(props: ButtonProps) {
  const { type, onClick, className, children } = props;
  useEffect(() => {}, []);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`button ${type} ${className}`}
    >
      {children}
    </button>
  );
}

export default Button;
