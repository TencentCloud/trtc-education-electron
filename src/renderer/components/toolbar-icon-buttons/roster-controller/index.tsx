import a18n from 'a18n';
import React from 'react';
import PeopleAltSharpIcon from '@material-ui/icons/PeopleAltSharp';
import Toast from '../../toast';
import ComBaseToolIconButton from '../base';
import logger from '../../../utils/logger';

interface ComRoasterControllerPropsType {
  mode?: string;
}

function ComRoasterController(props: ComRoasterControllerPropsType) {
  const { mode } = props;
  const renderIcon = () => <PeopleAltSharpIcon />;
  const onIconClick = () => {
    logger.log('[ComRoasterController] clicked');
    Toast.error(a18n('暂未实现，敬请期待'), 5000);
    (window as any).appMonitor?.reportEvent('OpenRoaster');
  };

  return (
    <ComBaseToolIconButton
      name={a18n('花名册')}
      mode={mode}
      renderIcon={renderIcon}
      onClickIcon={onIconClick}
    />
  );
}

ComRoasterController.defaultProps = {
  mode: 'small',
};

export default ComRoasterController;
