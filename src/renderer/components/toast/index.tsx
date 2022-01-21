import React, { useState, useEffect } from 'react';
import Notice, { INotice } from './notice';

export default class Toast {
  static info: any = () => {};

  static success: any = () => {};

  static warning: any = () => {};

  static error: any = () => {};

  static loading: any = () => {};
}

export function Notification() {
  const [notices, setNotices] = useState([] as INotice[]);

  const addNotice = (notice: INotice) => {
    const key = `${notice.type}_${Date.now()}`;
    const newNotice = {
      key,
      ...notice,
    };
    setNotices([...notices, newNotice]);
  };

  useEffect(() => {
    Toast.info = (message: string, duration: number, onClose: () => void) => {
      addNotice({ type: 'info', message, duration, onClose });
    };
    Toast.success = (
      message: string,
      duration: number,
      onClose: () => void
    ) => {
      addNotice({ type: 'success', message, duration, onClose });
    };
    Toast.warning = (
      message: string,
      duration: number,
      onClose: () => void
    ) => {
      addNotice({ type: 'warning', message, duration, onClose });
    };
    Toast.error = (message: string, duration: number, onClose: () => void) => {
      addNotice({ type: 'error', message, duration, onClose });
    };
    Toast.loading = (
      message: string,
      duration: number,
      onClose: () => void
    ) => {
      addNotice({ type: 'loading', message, duration, onClose });
    };
  });

  return notices.length > 0 ? (
    <div>
      {notices.map((notice: INotice) => (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <Notice key={notice.key} {...notice} />
      ))}
    </div>
  ) : null;
}
