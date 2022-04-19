import a18n from 'a18n';
import React from 'react';
import MuteAllIcon from '../../ui-widget/icon/svg-icon/mute-all';
import UnmuteAllIcon from '../../ui-widget/icon/svg-icon/unmute-all';
import ComBaseToolIconButton from '../base';
import logger from '../../../utils/logger';

interface PropsType {
  mode?: string;
  isMute?: boolean;
  onMuteAllStudent: () => void;
}

function ComMuteAllController(props: PropsType) {
  const { mode, isMute, onMuteAllStudent } = props;
  const renderIcon = () => {
    return <>{isMute ? <MuteAllIcon /> : <UnmuteAllIcon />}</>;
  };
  const onIconClick = () => {
    logger.log('[ComMuteAllController] clicked');
    onMuteAllStudent();
  };

  return (
    <ComBaseToolIconButton
      name={a18n('全员禁麦')}
      muted={isMute}
      mode={mode}
      renderIcon={renderIcon}
      onClickIcon={onIconClick}
    />
  );
}

ComMuteAllController.defaultProps = {
  mode: 'small',
  isMute: false,
};

export default ComMuteAllController;
