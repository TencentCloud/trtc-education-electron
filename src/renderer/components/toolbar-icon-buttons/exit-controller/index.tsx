import a18n from 'a18n';
import React from 'react';
import ExitToAppOutlinedIcon from '@material-ui/icons/ExitToAppOutlined';
import logger from '../../../utils/logger';
import ComBaseToolIconButton from '../base';

interface PropsType {
  role: string;
  mode?: string;
  onExit: () => void;
}

function ComExitController(props: PropsType) {
  const { role, mode, onExit } = props;
  const renderIcon = () => <ExitToAppOutlinedIcon />;
  const onIconClick = () => {
    logger.log('[ComExitController] clicked');
    onExit();
  };

  return (
    <ComBaseToolIconButton
      name={role === 'teacher' ? a18n('下课') : a18n('离开教室')}
      mode={mode}
      renderIcon={renderIcon}
      onClickIcon={onIconClick}
    />
  );
}

ComExitController.defaultProps = {
  mode: 'small',
};

export default ComExitController;
