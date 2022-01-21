import React, { ReactNode } from 'react';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Popover from '@material-ui/core/Popover';
import IconButton from '@material-ui/core/IconButton';
import { EPopupType } from '../../../../types';
import './index.scss';

interface BaseIconButtonProps {
  muted?: boolean;
  mode?: string;
  onClickIcon: (event: React.MouseEvent<HTMLElement>) => void;
  renderIcon: () => ReactNode;
  name: string;
  popupType?: EPopupType | null;
  renderInnerPopover?: () => ReactNode | null;
  onOpenOuterPopover?: (data: any) => void | null;
}

function BaseIconButton(props: BaseIconButtonProps) {
  const {
    muted,
    mode,
    onClickIcon,
    renderIcon,
    name,
    popupType,
    renderInnerPopover,
    onOpenOuterPopover,
  } = props;

  const [anchorEl, setAnchorEl] = React.useState<HTMLDivElement | null>(null);

  const popOpenHandler = (event: React.MouseEvent<HTMLDivElement>) => {
    if (popupType === EPopupType.OuterWindow) {
      if (onOpenOuterPopover && typeof onOpenOuterPopover === 'function') {
        onOpenOuterPopover(event.currentTarget.getBoundingClientRect());
      }
    } else {
      setAnchorEl(event.currentTarget);
    }
  };

  const popCloseHandler = () => {
    setAnchorEl(null);
  };

  const onPopoverClick = () => {
    popCloseHandler();
  };

  const open = Boolean(anchorEl);
  const id = open ? 'com-tool-icon-button-popover' : undefined;

  return (
    <div className={`com-tool-icon-button-base com-tool-icon-${mode}`}>
      <div className="icon-content" onClick={onClickIcon}>
        <IconButton className={`icon-button ${muted ? 'muted' : ''}`}>
          {renderIcon()}
        </IconButton>
        <div className="icon-title">{name}</div>
      </div>
      {popupType && (
        <>
          <div className="icon-selector" onClick={popOpenHandler}>
            <ExpandMoreIcon />
          </div>
          {popupType === EPopupType.InnerWindow && (
            <Popover
              id={id}
              open={open}
              anchorEl={anchorEl}
              className="trtc-edu-popover"
              onClose={popCloseHandler}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
            >
              <div className="popover-content" onClick={onPopoverClick}>
                {renderInnerPopover && renderInnerPopover()}
              </div>
            </Popover>
          )}
        </>
      )}
    </div>
  );
}

BaseIconButton.defaultProps = {
  muted: false,
  mode: 'small',
  popupType: null,
  renderInnerPopover: null,
  onOpenOuterPopover: null,
};

export default BaseIconButton;
