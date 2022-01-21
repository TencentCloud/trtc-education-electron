import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import GestureIcon from '@material-ui/icons/Gesture';
import TextFieldsIcon from '@material-ui/icons/TextFields';
import UndoIcon from '@material-ui/icons/Undo';
import RedoIcon from '@material-ui/icons/Redo';
import PointerMouseIcon from '../../../../../../components/ui-widget/icon/svg-icon/pointer-mouse';
import EraseIcon from '../../../../../../components/ui-widget/icon/svg-icon/erase';
import LineIcon from '../../../../../../components/ui-widget/icon/svg-icon/line';
import RectIcon from '../../../../../../components/ui-widget/icon/svg-icon/rect';
import EllipseIcon from '../../../../../../components/ui-widget/icon/svg-icon/ellipse';
import './toolbar.scss';

function WhiteBoardDrawToolbar(props: Record<string, any>) {
  const {
    onChooseMouse,
    onChooseLine,
    onChooseCurve,
    onChooseText,
    onChooseRect,
    onChooseEllipse,
    onChooseErase,
    onUndo,
    onRedo,
  } = props;
  return (
    <div className="white-board-draw-toolbar">
      <IconButton aria-label="mouse" onClick={onChooseMouse}>
        <PointerMouseIcon />
      </IconButton>
      <IconButton aria-label="Draw line" onClick={onChooseLine}>
        <LineIcon />
      </IconButton>
      <IconButton aria-label="Draw curve" onClick={onChooseCurve}>
        <GestureIcon />
      </IconButton>
      <IconButton aria-label="Write text" onClick={onChooseText}>
        <TextFieldsIcon />
      </IconButton>
      <IconButton aria-label="Draw Rectangle" onClick={onChooseRect}>
        <RectIcon />
      </IconButton>
      <IconButton aria-label="Draw Ellipse" onClick={onChooseEllipse}>
        <EllipseIcon />
      </IconButton>
      <IconButton aria-label="Delete graphic" onClick={onChooseErase}>
        <EraseIcon />
      </IconButton>
      <IconButton aria-label="Undo" onClick={onUndo}>
        <UndoIcon />
      </IconButton>
      <IconButton aria-label="Redo" onClick={onRedo}>
        <RedoIcon />
      </IconButton>
    </div>
  );
}

export default WhiteBoardDrawToolbar;
