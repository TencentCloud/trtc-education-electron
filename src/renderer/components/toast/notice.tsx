import React from 'react';
import { Alert } from '@material-ui/lab';
import { Snackbar } from '@material-ui/core';
import './index.scss';

export interface INotice {
  key?: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'loading';
  message: string;
  duration: number;
  onClose: () => void;
}

/**
 * 封装 Alert、Snackbar 组件, 实现 Notification 组件
 * @param {object} props
 * @params {object} props 包含 isOpen, type, message, duration 属性的对象
 * @params {string} props.type Alert 组件的消息类型, 枚举值有: 'error', 'info', 'success', 'warning'
 * @params {string} props.message 提示的消息内容
 * @params {number}} props.duration 消息提示持续时间
 */
export default function Notice(props: INotice) {
  const defaultDuration = 3000;
  const defaultAlertType = 'info';
  const [open, setOpen] = React.useState(true);
  // eslint-disable-next-line react/prop-types
  const { type, message, duration, onClose } = props;
  const handleClose = () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    onClose && onClose();
    setOpen(false);
  };

  return (
    <Snackbar
      className="trtc-edu-snack-bar"
      open={open}
      message={message}
      autoHideDuration={duration || defaultDuration}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      onClose={handleClose}
    >
      <Alert
        className="trtc-edu-alert"
        severity={(type || defaultAlertType) as any}
        onClose={handleClose}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
