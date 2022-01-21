import logger from '../../utils/logger';
import { GraphicConfig, DrawModeType } from './types';

class BaseGraphic {
  static LOG_PREFIX = '[WB-BasicGraphic]';

  protected ctx: any;

  protected config: GraphicConfig = {
    color: '#ffffff',
    mode: DrawModeType.Stroke,
    lineWidth: 1,
    shadowColor: '',
  };

  protected pointCoods: Array<Record<string, number>> | null;

  protected deleteFlag = false;

  constructor(ctx: any, config: GraphicConfig) {
    logger.log(`${BaseGraphic.LOG_PREFIX}.constructor config:`, config);
    this.ctx = ctx;
    this.config = Object.assign(this.config, config);
    this.pointCoods = [];
  }

  setStartPoint(x: number, y: number) {
    this.pointCoods?.push({ x, y });
  }

  addPoint(x: number, y: number) {
    this.pointCoods?.push({ x, y });
  }

  setEndPoint(x: number, y: number) {
    this.pointCoods?.push({ x, y });
  }

  // eslint-disable-next-line class-methods-use-this
  setText(text: string) {
    logger.log(`${BaseGraphic.LOG_PREFIX}.setText text: ${text}`);
  }

  setShadowColor(color: string) {
    this.config.shadowColor = color;
  }

  // eslint-disable-next-line class-methods-use-this
  draw(ctx: any) {
    logger.log(`${BaseGraphic.LOG_PREFIX}.draw ctx:`, ctx);
  }

  // eslint-disable-next-line class-methods-use-this
  drawShadow(ctx: any, config: GraphicConfig) {
    logger.log(`${BaseGraphic.LOG_PREFIX}.drawShadow ctx:`, ctx);
  }

  setDeleteFlag(flag: boolean) {
    this.deleteFlag = flag;
  }

  getDeleteFlag() {
    return this.deleteFlag;
  }
}

export default BaseGraphic;
