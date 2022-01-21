import logger from '../../utils/logger';
import { GraphicConfig } from './types';
import BaseGraphic from './BaseGraphic';

class Curve extends BaseGraphic {
  static LOG_PREFIX = '[WB-Curve]';

  constructor(ctx: any, config: GraphicConfig) {
    super(ctx, config);
    logger.log(`${Curve.LOG_PREFIX}.constructor`);
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

  draw(ctx: any) {
    if (this.pointCoods && this.pointCoods.length) {
      ctx.beginPath();
      this.pointCoods.forEach((point, index) => {
        if (index !== 0) {
          ctx.lineTo(point.x, point.y);
        } else {
          ctx.moveTo(point.x, point.y);
        }
      });
      ctx.stroke();
    }
  }

  drawShadow(ctx: any, config: GraphicConfig) {
    if (this.pointCoods && this.pointCoods.length) {
      ctx.lineWidth = 5;
      ctx.strokeStyle = this.config.shadowColor;
      ctx.beginPath();
      this.pointCoods.forEach((point, index) => {
        if (index !== 0) {
          ctx.lineTo(point.x, point.y);
        } else {
          ctx.moveTo(point.x, point.y);
        }
      });
      ctx.stroke();
    }
  }
}

export default Curve;
