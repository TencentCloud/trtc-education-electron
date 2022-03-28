import React from 'react';
import TextsmsIcon from '@material-ui/icons/Textsms';
import Toast from '../../toast';
import ComBaseToolIconButton from '../base';
import logger from '../../../utils/logger';

function ComInstantMessageController() {
  const renderIcon = () => <TextsmsIcon />;
  const onIconClick = () => {
    logger.log('[ComInstantMessageController] clicked');
    Toast.error('暂未实现，敬请期待', 5000);
  };

  return (
    <ComBaseToolIconButton
      name="消息"
      renderIcon={renderIcon}
      onClickIcon={onIconClick}
    />
  );
}

export default ComInstantMessageController;
