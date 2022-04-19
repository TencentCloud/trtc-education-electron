import a18n from 'a18n';
import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import './index.scss';

interface ConfirmDialogProps {
  show: boolean | false;
  confirmText?: string;
  cancelText?: string;
  onCancel?: () => void;
  onConfirm: () => void;
  children?: React.ReactNode;
}

function ConfirmDialog(props: ConfirmDialogProps) {
  const { show, confirmText, cancelText, onCancel, onConfirm, children } =
    props;
  const handleConfirm = () => {
    onConfirm();
  };
  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={show}
      onClose={onCancel}
      aria-labelledby="screen-sharing-selection-dialog-title"
    >
      <DialogContent dividers>
        <div className="content-style">{children}</div>
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={handleConfirm}>
          {confirmText || a18n('确认')}
        </Button>
        {onCancel && (
          <Button onClick={onCancel}>{cancelText || a18n('取消')}</Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

ConfirmDialog.defaultProps = {
  onCancel: undefined,
  children: null,
  confirmText: a18n('确认'),
  cancelText: a18n('取消'),
};

export default ConfirmDialog;
