import React from 'react';
import QuestionAnswerSharpIcon from '@material-ui/icons/QuestionAnswerSharp';
import Toast from '../../toast';
import ComBaseToolIconButton from '../base';
import logger from '../../../utils/logger';

function ComAnnotationController() {
  const renderIcon = () => <QuestionAnswerSharpIcon />;
  const onIconClick = () => {
    logger.log('[ComAnnotationController] clicked');
    Toast.error('暂未实现，敬请期待', 5000);
  };

  return (
    <ComBaseToolIconButton
      name="互动批注"
      renderIcon={renderIcon}
      onClickIcon={onIconClick}
    />
  );
}

export default ComAnnotationController;
