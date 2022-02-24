import React from 'react';
import LinkIcon from '@material-ui/icons/Link';
import ComBaseToolIconButton from '../base';
import logger from '../../../utils/logger';

function OfficialWebsiteLinkController() {
  const renderIcon = () => <LinkIcon style={{ fontSize: 20 }} />;
  const onIconClick = () => {
    logger.log('[OfficialWebsiteLinkController] clicked');
    (window as any).electron.openExternal(
      'https://cloud.tencent.com/document/product/647/45465'
    );
  };

  return (
    <ComBaseToolIconButton
      name="github"
      renderIcon={renderIcon}
      onClickIcon={onIconClick}
    />
  );
}

export default OfficialWebsiteLinkController;
