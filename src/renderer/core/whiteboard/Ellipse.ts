import logger from '../../utils/logger';
import { GraphicConfig, DrawModeType } from './types';
import BaseGraphic from './BaseGraphic';

class Ellipse extends BaseGraphic {
  static LOG_PREFIX = '[WB-Ellipse]';

  private centerX: number | null;

  private centerY: number | null;

  private radiusX: number;

  private radiusY: number;

  constructor(ctx: any, config: GraphicConfig) {
    super(ctx, config);
    logger.log(`${Ellipse.LOG_PREFIX}.constructor config:`, config);
    this.centerX = null;
    this.centerY = null;
    this.radiusX = 0;
    this.radiusY = 0;
  }

  setStartPoint(x: number, y: number) {
    this.pointCoods?.push({ x, y });
  }

  addPoint(x: number, y: number) {
    this.setEndPoint(x, y);
  }

  setEndPoint(x: number, y: number) {
    if (this.pointCoods && this.pointCoods[0]) {
      this.pointCoods[1] = { x, y };

      // Calculate ellipse data
      const x1 = this.pointCoods[0].x;
      const y1 = this.pointCoods[0].y;
      const x2 = this.pointCoods[1].x;
      const y2 = this.pointCoods[1].y;
      this.centerX = (x1 + x2) / 2;
      this.centerY = (y1 + y2) / 2;
      this.radiusX = Math.abs(x1 - x2) / 2;
      this.radiusY = Math.abs(y1 - y2) / 2;
    } else {
      logger.error(
        `${Ellipse.LOG_PREFIX}.setEndPoint error: start point not exist`
      );
    }
  }

  draw(ctx: any) {
    if (this.centerX !== null && this.centerY !== null) {
      ctx.save();
      if (this.config.mode === DrawModeType.Fill) {
        ctx.fillStyle = this.config.color;
        ctx.beginPath();
        ctx.ellipse(
          this.centerX,
          this.centerY,
          this.radiusX,
          this.radiusY,
          0,
          0,
          Math.PI * 2,
          true
        );
        ctx.fill();
      } else {
        // this.config.mode === DrawModeType.Stroke
        ctx.strokeStyle = this.config.color;
        ctx.beginPath();
        ctx.ellipse(
          this.centerX,
          this.centerY,
          this.radiusX,
          this.radiusY,
          0,
          0,
          Math.PI * 2,
          true
        );
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  drawShadow(ctx: any, config: GraphicConfig) {
    if (this.centerX !== null && this.centerY !== null) {
      ctx.save();

      if (this.config.mode === DrawModeType.Fill) {
        ctx.fillStyle = this.config.shadowColor;
        ctx.beginPath();
        ctx.ellipse(
          this.centerX,
          this.centerY,
          this.radiusX,
          this.radiusY,
          0,
          0,
          Math.PI * 2,
          true
        );
        ctx.fill();
      } else {
        // this.config.mode === DrawModeType.Stroke
        ctx.lineWidth = 5;
        ctx.strokeStyle = this.config.shadowColor;
        ctx.beginPath();
        ctx.ellipse(
          this.centerX,
          this.centerY,
          this.radiusX,
          this.radiusY,
          0,
          0,
          Math.PI * 2,
          true
        );
        ctx.stroke();
      }

      ctx.restore();
    }
  }
}

export default Ellipse;
