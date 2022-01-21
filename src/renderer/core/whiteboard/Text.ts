import logger from '../../utils/logger';
import { GraphicConfig } from './types';
import BaseGraphic from './BaseGraphic';
import WhiteboardConstant from './constant';

class Text extends BaseGraphic {
  static LOG_PREFIX = '[WB-Text]';

  private x: number | null;

  private y: number | null;

  private text: string;

  private width = 0;

  private height = 0;

  constructor(ctx: any, config: GraphicConfig) {
    super(ctx, config);
    logger.log(`${Text.LOG_PREFIX}.constructor config:`, config);
    this.x = null;
    this.y = null;
    this.text = '';
  }

  setStartPoint(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  setText(text: string) {
    this.text = text;
  }

  draw(ctx: any) {
    logger.log(`${Text.LOG_PREFIX}.draw config:`, this.config);
    if (this.x !== null && this.y !== null) {
      ctx.save();

      ctx.font = WhiteboardConstant.DEFAULT.FONT;
      const lines = this.text.split('\n');
      this.height = WhiteboardConstant.DEFAULT.LINE_HEIGHT * lines.length;
      lines.forEach((line, index) => {
        const textMetrics = ctx.measureText(line);
        if (this.width < textMetrics.width) {
          this.width = textMetrics.width;
        }
        ctx.fillText(
          line,
          this.x,
          (this.y || 0) + WhiteboardConstant.DEFAULT.LINE_HEIGHT * (index + 1)
        );
      });

      ctx.restore();
    }
  }

  drawShadow(ctx: any, config: GraphicConfig) {
    logger.log(`${Text.LOG_PREFIX}.drawShadow config:`, this.config);
    if (this.x !== null && this.y !== null) {
      ctx.save();
      ctx.fillStyle = this.config.shadowColor;
      ctx.fillRect(this.x, this.y, this.width, this.height);
      ctx.restore();
    }
  }
}

export default Text;
