import logger from '../../utils/logger';
import { GraphicConfig, DrawModeType } from './types';
import BaseGraphic from './BaseGraphic';

class Rect extends BaseGraphic {
  static LOG_PREFIX = '[WB-Rect]';

  private x: number | null;

  private y: number | null;

  private width = 0;

  private height = 0;

  constructor(ctx: any, config: GraphicConfig) {
    super(ctx, config);
    logger.log(`${Rect.LOG_PREFIX}.constructor config:`, config);
    this.x = null;
    this.y = null;
  }

  setStartPoint(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  addPoint(x: number, y: number) {
    this.setEndPoint(x, y);
  }

  setEndPoint(x: number, y: number) {
    if (this.x !== null && this.y !== null) {
      this.width = x - this.x;
      this.height = y - this.y;
    } else {
      logger.error(`${Rect.LOG_PREFIX}.setEndPoint error, no start point`);
    }
  }

  draw(ctx: any) {
    logger.log(`${Rect.LOG_PREFIX}.draw config:`, this.config);
    if (this.x !== null && this.y !== null) {
      ctx.save();
      if (this.config.mode === DrawModeType.Fill) {
        ctx.fillStyle = this.config.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
      } else {
        // this.config.mode === DrawModeType.Stroke
        ctx.strokeStyle = this.config.color;
        ctx.lineWidth = this.config.lineWidth;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
      }
      ctx.restore();
    }
  }

  drawShadow(ctx: any, config: GraphicConfig) {
    if (this.x !== null && this.y !== null) {
      if (this.config.mode === DrawModeType.Fill) {
        ctx.fillStyle = this.config.shadowColor;
        ctx.fillRect(this.x, this.y, this.width, this.height);
      } else {
        // this.config.mode === DrawModeType.Stroke
        ctx.lineWidth = 5;
        ctx.strokeStyle = this.config.shadowColor;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.width, this.y);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.lineTo(this.x, this.y + this.height);
        ctx.closePath();
        ctx.stroke();
      }
    }
  }
}

export default Rect;
