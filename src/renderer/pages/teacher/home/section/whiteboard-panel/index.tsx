import React, { useEffect, useRef } from 'react';
import logger from '../../../../../utils/logger';
import WhiteboardToolbar from './sections/toolbar';
import Whiteboard, {
  WhiteboardToolType,
  WhiteboardGraphicType,
  DrawModeType,
} from '../../../../../core/whiteboard/index';
import './index.scss';

let wb: Whiteboard | null = null;

function WhiteboardPanel(props: Record<string, any>) {
  const logPrefix = '[WhiteBoard]';
  const { onUpdateBounds } = props;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logger.log(
      `${logPrefix}.useEffect init white-board bounds:`,
      ref,
      onUpdateBounds
    );
    if (ref && ref.current) {
      if (onUpdateBounds) {
        onUpdateBounds(ref.current.getBoundingClientRect());
      }
    }
  }, []);

  const onWindowResize = () => {
    logger.log(`${logPrefix}.onWindowResize`);
    if (onUpdateBounds && ref?.current) {
      onUpdateBounds(ref.current.getBoundingClientRect());
    }
  };

  // 处理resize事件
  useEffect(() => {
    window.addEventListener('resize', onWindowResize, false);

    return () => {
      window.removeEventListener('resize', onWindowResize, false);
    };
  }, []);

  // 初始化白板，只需要执行一次
  useEffect(() => {
    logger.log(`${logPrefix}.useEffect init whiteboard`);
    const whiteboardContainer = document.getElementById(
      'white-board'
    ) as HTMLDivElement;
    wb = new Whiteboard(whiteboardContainer);

    return () => {
      if (wb) {
        wb.destroy();
      }
    };
  }, []); // 无依赖，只创建一次

  const onChooseMouse = () => {
    wb?.chooseTool({ toolType: WhiteboardToolType.Mouse });
  };

  const onChooseLine = () => {
    wb?.chooseTool({
      toolType: WhiteboardToolType.Graphic,
      graphicType: WhiteboardGraphicType.Line,
    });
  };

  const onChooseCurve = () => {
    wb?.chooseTool({
      toolType: WhiteboardToolType.Graphic,
      graphicType: WhiteboardGraphicType.Curve,
    });
  };

  const onChooseErase = () => {
    wb?.chooseTool({ toolType: WhiteboardToolType.Erase });
  };

  const onChooseText = () => {
    wb?.chooseTool({
      toolType: WhiteboardToolType.Graphic,
      graphicType: WhiteboardGraphicType.Text,
    });
  };

  const onChooseRect = () => {
    wb?.chooseTool({
      toolType: WhiteboardToolType.Graphic,
      graphicType: WhiteboardGraphicType.Rect,
      graphicConfig: { mode: DrawModeType.Stroke, color: '#ff0000' },
    });
  };

  const onChooseEllipse = () => {
    wb?.chooseTool({
      toolType: WhiteboardToolType.Graphic,
      graphicType: WhiteboardGraphicType.Ellipse,
      graphicConfig: { mode: DrawModeType.Fill, color: '#0000ff' },
    });
  };

  const onUndo = () => {
    wb?.undo();
  };

  const onRedo = () => {
    wb?.redo();
  };

  return (
    <div className="whiteboard-panel">
      <div id="white-board" ref={ref}>
        {/* <canvas id="wb-canvas" width="1600" height="900" /> */}
      </div>
      <WhiteboardToolbar
        onChooseMouse={onChooseMouse}
        onChooseLine={onChooseLine}
        onChooseCurve={onChooseCurve}
        onChooseText={onChooseText}
        onChooseRect={onChooseRect}
        onChooseEllipse={onChooseEllipse}
        onChooseErase={onChooseErase}
        onUndo={onUndo}
        onRedo={onRedo}
      />
    </div>
  );
}

export default WhiteboardPanel;
