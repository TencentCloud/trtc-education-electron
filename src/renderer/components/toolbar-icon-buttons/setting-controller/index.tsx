import a18n from 'a18n';
import React from 'react';
import SettingsSharpIcon from '@material-ui/icons/SettingsSharp';
import Toast from '../../toast';
import ComBaseToolIconButton from '../base';
import logger from '../../../utils/logger';

interface PropsType {
  mode?: string;
  onClick?: () => void;
}

function ComSettingController(props: PropsType) {
  const { mode, onClick } = props;
  const renderIcon = () => <SettingsSharpIcon />;
  const onIconClick = () => {
    logger.log('[ComSettingController] clicked');
    Toast.error(a18n('暂未实现，敬请期待'), 5000);
    (window as any).appMonitor?.reportEvent('OpenSettingWindow');
    if (typeof onClick === 'function') {
      onClick();
    }
  };

  return (
    <ComBaseToolIconButton
      name={a18n('设置')}
      mode={mode}
      renderIcon={renderIcon}
      onClickIcon={onIconClick}
    />
  );
}

ComSettingController.defaultProps = {
  mode: 'small',
  onClick: () => {},
};

export default ComSettingController;
