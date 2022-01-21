import logger from '../../utils/logger';
import { GraphicConfig } from './types';
import BaseGraphic from './BaseGraphic';

class Line extends BaseGraphic {
  static LOG_PREFIX = '[WB-Line]';

  constructor(ctx: any, config: GraphicConfig) {
    super(ctx, config);
    logger.log(`${Line.LOG_PREFIX}.constructor`);
  }

  addPoint(x: number, y: number) {
    this.setEndPoint(x, y);
  }

  setEndPoint(x: number, y: number) {
    if (this.pointCoods && this.pointCoods[1]) {
      this.pointCoods[1] = { x, y };
    } else {
      this.pointCoods?.push({ x, y });
    }
  }

  draw(ctx: any) {
    if (this.pointCoods && this.pointCoods.length) {
      ctx.beginPath();
      ctx.moveTo(this.pointCoods[0].x, this.pointCoods[0].y);
      ctx.lineTo(this.pointCoods[1].x, this.pointCoods[1].y);
      ctx.stroke();
    }
  }

  drawShadow(ctx: any, config: GraphicConfig) {
    if (this.pointCoods && this.pointCoods.length && ctx) {
      ctx.lineWidth = 5;
      ctx.strokeStyle = this.config.shadowColor;
      ctx.beginPath();
      ctx.moveTo(this.pointCoods[0].x, this.pointCoods[0].y);
      ctx.lineTo(this.pointCoods[1].x, this.pointCoods[1].y);
      ctx.stroke();
    }
  }
}

export default Line;
