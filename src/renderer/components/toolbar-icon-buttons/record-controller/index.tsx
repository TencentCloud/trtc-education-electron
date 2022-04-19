import a18n from 'a18n';
import React from 'react';
import RecorderIcon from '../../ui-widget/icon/svg-icon/recorder';
import Toast from '../../toast';
import ComBaseToolIconButton from '../base';
import logger from '../../../utils/logger';

interface PropsType {
  mode?: string;
}

function ComRecordController(props: PropsType) {
  const { mode } = props;
  const renderIcon = () => <RecorderIcon />;
  const onIconClick = () => {
    logger.log('[ComRecordController] clicked');
    Toast.error(a18n('暂未实现，敬请期待'), 5000);
    (window as any).appMonitor?.reportEvent('StartRecord');
  };

  return (
    <ComBaseToolIconButton
      name={a18n('屏幕录制')}
      mode={mode}
      renderIcon={renderIcon}
      onClickIcon={onIconClick}
    />
  );
}

ComRecordController.defaultProps = {
  mode: 'small',
};

export default ComRecordController;
