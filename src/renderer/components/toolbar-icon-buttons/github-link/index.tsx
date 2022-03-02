import React from 'react';
import GitHubIcon from '@material-ui/icons/GitHub';
import ComBaseToolIconButton from '../base';
import logger from '../../../utils/logger';

function GithubController() {
  const renderIcon = () => <GitHubIcon style={{ fontSize: 20 }} />;
  const onIconClick = () => {
    logger.log('[ComGithubController] clicked');
    (window as any).electron.openExternal(
      'https://github.com/TencentCloud/trtc-education-electron'
    );
    (window as any).appMonitor?.reportEvent('GotoGithub');
  };

  return (
    <ComBaseToolIconButton
      name="github"
      renderIcon={renderIcon}
      onClickIcon={onIconClick}
    />
  );
}

export default GithubController;
