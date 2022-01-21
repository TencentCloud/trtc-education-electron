import logger from '../../utils/logger';
import { WhiteboardGraphicType, GraphicConfig } from './types';
import BaseGraphic from './BaseGraphic';
import Line from './Line';
import Curve from './Curve';
import Rect from './Rect';
import Ellipse from './Ellipse';
import Text from './Text';

const GraphicFactory = {
  logPrefix: '[WB-GraphicFactory]',
  createGraphic(ctx: any, config: GraphicConfig) {
    logger.log(`${this.logPrefix}.createGraphic:`, ctx, config);
    let graphic: BaseGraphic | null = null;
    switch (config.graphicType) {
      case WhiteboardGraphicType.Line:
        graphic = new Line(ctx, config);
        break;
      case WhiteboardGraphicType.Curve:
        graphic = new Curve(ctx, config);
        break;
      case WhiteboardGraphicType.Rect:
        graphic = new Rect(ctx, config);
        break;
      case WhiteboardGraphicType.Ellipse:
        graphic = new Ellipse(ctx, config);
        break;
      case WhiteboardGraphicType.Text:
        graphic = new Text(ctx, config);
        break;
      default:
        logger.error(
          `${this.logPrefix}.createGraphic unknown graphic type:`,
          config
        );
        break;
    }

    return graphic;
  },
};

export default GraphicFactory;
