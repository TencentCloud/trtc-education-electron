import React from 'react';
import Modal from '@material-ui/core/Modal';
import logger from '../../utils/logger';

function DeviceDetectModal() {
  const open = true;
  function handleClose() {
    logger.log('nothing');
  }
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
    >
      <div>hello</div>
    </Modal>
  );
}

export default DeviceDetectModal;
