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
    Toast.error('暂未实现，敬请期待', 5000);
    if (typeof onClick === 'function') {
      onClick();
    }
  };

  return (
    <ComBaseToolIconButton
      name="设置"
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
