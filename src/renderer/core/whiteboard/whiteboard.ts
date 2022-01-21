import logger from '../../utils/logger';
import {
  WhiteboardToolType,
  WhiteboardGraphicType,
  GraphicConfig,
} from './types';
import GraphicFactory from './GraphicFactory';
import BaseGraphic from './BaseGraphic';
import TextEditor from './TextEditor';

const CANVAS_WIDTH = 3200;
const CANVAS_HEIGHT = 1800;

interface WhiteboardTool {
  toolType: WhiteboardToolType;
  graphicType?: WhiteboardGraphicType;
  graphicConfig?: GraphicConfig;
}

enum ActionType {
  Draw = 1,
  Delete = 2,
}

interface ActionMemento {
  action: ActionType;
  index: number;
}

class Whiteboard {
  static LOG_PREFIX = '[WB-Whiteboard]';

  private canvas: HTMLCanvasElement | null;

  private shadowCanvas: HTMLCanvasElement | null;

  private config: WhiteboardTool = {
    toolType: WhiteboardToolType.Graphic,
    graphicType: WhiteboardGraphicType.Curve,
  };

  private currentTool: WhiteboardToolType;

  private currentGraphicType: WhiteboardGraphicType;

  private currentGraphic: BaseGraphic | null;

  private graphicQueue: Array<BaseGraphic>;

  private graphicShadowMap: Map<
    string,
    { graphic: BaseGraphic; index: number }
  >;

  private actionMemeQueue: Array<ActionMemento> = [];

  private currentActionMemeIndex = -1;

  private textEditor: TextEditor | null;

  constructor(whiteboardContainer: HTMLDivElement) {
    if (!whiteboardContainer) {
      logger.error(
        `${Whiteboard.LOG_PREFIX}.constructor invalid args: whiteboardContainer cannot be null`
      );
      throw Error('Whiteboard container element cannot be null');
    }
    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    whiteboardContainer.appendChild(canvas);
    this.canvas = canvas;

    this.shadowCanvas = document.createElement('canvas'); // 注意：目前测试发现，不加入 DOM 树也能正常使用
    this.shadowCanvas.width = CANVAS_WIDTH;
    this.shadowCanvas.height = CANVAS_HEIGHT;
    this.currentTool = WhiteboardToolType.Graphic;
    this.currentGraphicType = WhiteboardGraphicType.Curve;
    this.currentGraphic = null;
    this.graphicQueue = [];
    this.graphicShadowMap = new Map();
    this.textEditor = null;

    this.onMouseDownHandler = this.onMouseDownHandler.bind(this);
    this.onMouseMoveHandler = this.onMouseMoveHandler.bind(this);
    this.onMouseUpHandler = this.onMouseUpHandler.bind(this);
    this.onClickCanvasHandler = this.onClickCanvasHandler.bind(this);
    this.onFinishTextEdit = this.onFinishTextEdit.bind(this);
    this.registerEventListener();
  }

  private setToolConfig(config: WhiteboardTool) {
    this.config = Object.assign(this.config, config);
  }

  private destroyTextEditor() {
    if (this.textEditor) {
      this.textEditor.destroy();
      this.textEditor = null;
    }
  }

  // 选择工具
  chooseTool(config: WhiteboardTool) {
    this.currentTool = config.toolType;
    switch (config.toolType) {
      case WhiteboardToolType.Mouse:
        break;
      case WhiteboardToolType.Graphic:
        if (config.graphicType !== WhiteboardGraphicType.Text) {
          this.destroyTextEditor();
        }
        break;
      case WhiteboardToolType.Erase:
        break;
      default:
        logger.log(
          `${Whiteboard.LOG_PREFIX}.chooseTool unknown tool type:`,
          config.toolType
        );
    }
    this.setToolConfig(config);
  }

  // 选择图形
  private createCurrentGraphic() {
    logger.log(
      `${Whiteboard.LOG_PREFIX}.createCurrentGraphic config:`,
      this.config
    );
    if (this.config.graphicType) {
      this.currentGraphicType = this.config.graphicType;
    }
    this.currentGraphic = GraphicFactory.createGraphic(
      this.canvas?.getContext('2d'),
      {
        graphicType: this.currentGraphicType,
        ...this.config.graphicConfig,
      }
    );
  }

  private registerEventListener() {
    logger.log(`${Whiteboard.LOG_PREFIX}.registerEventListener`);
    document.addEventListener('mousedown', this.onMouseDownHandler, false);
    if (this.canvas) {
      this.canvas.addEventListener('click', this.onClickCanvasHandler, false);
    }
  }

  private unregisterEventListener() {
    logger.log(`${Whiteboard.LOG_PREFIX}.unregisterEventListener`);
    document.removeEventListener('mousedown', this.onMouseDownHandler, false);
    if (this.canvas) {
      this.canvas.removeEventListener(
        'click',
        this.onClickCanvasHandler,
        false
      );
    }
  }

  addAction(action: ActionMemento) {
    // eslint-disable-next-line no-plusplus
    this.actionMemeQueue[++this.currentActionMemeIndex] = action;

    // undo 操作之后，this.currentActionMemeIndex 会小于 this.actionMemeQueue.length，
    // 此时，新增 Action 后，删除当前位置后的 Action 记录，不再支持这些 Action 的 redo 操作
    if (this.currentActionMemeIndex + 1 !== this.actionMemeQueue.length) {
      this.actionMemeQueue.splice(
        this.currentActionMemeIndex + 1,
        this.actionMemeQueue.length - this.currentActionMemeIndex - 1
      );
    }
  }

  private domCoordsToCanvasCoords(clientX: number, clientY: number) {
    if (this.canvas) {
      const canvasBounds = this.canvas.getBoundingClientRect();
      return {
        canvasX: Math.floor(
          (CANVAS_WIDTH * (clientX - canvasBounds.left)) / canvasBounds.width
        ),
        canvasY: Math.floor(
          (CANVAS_HEIGHT * (clientY - canvasBounds.top)) / canvasBounds.height
        ),
      };
    }
    throw new Error(
      JSON.stringify({
        errorCode: 1002,
        errorMessage: 'canvas画布不存在',
      })
    );
  }

  private startCurrentDrawing(x: number, y: number) {
    if (this.currentGraphic) {
      if (x && y) {
        this.currentGraphic.setStartPoint(x, y);
      } else {
        const error = JSON.stringify({
          errorCode: 1001,
          errorMessage: 'canvas坐标计算错误',
        });
        throw Error(error);
      }
    }
  }

  private finishCurrentDrawing() {
    if (this.currentGraphic) {
      const newRandomColor = this.generateRandomColor();
      this.graphicShadowMap.set(newRandomColor, {
        graphic: this.currentGraphic,
        index: this.graphicQueue.length,
      });

      this.currentGraphic.setShadowColor(newRandomColor);
      this.graphicQueue.push(this.currentGraphic);
      this.currentGraphic = null;

      this.addAction({
        action: ActionType.Draw,
        index: this.graphicQueue.length - 1,
      });

      this.draw();
      this.drawShadow();
    }
  }

  private onFinishTextEdit(text: string) {
    logger.log(`${Whiteboard.LOG_PREFIX} text editor result: ${text}`);
    if (text.length > 0 && this.currentGraphic) {
      this.currentGraphic.setText(text);
      this.finishCurrentDrawing();
    }

    this.textEditor?.hide();
  }

  private onMouseDownHandler(event: MouseEvent) {
    logger.log(`${Whiteboard.LOG_PREFIX}.onMouseDownHandler`, this.canvas);
    if (this.currentTool === WhiteboardToolType.Graphic && this.canvas) {
      const { clientX, clientY } = event;
      const targetEl = document.elementFromPoint(clientX, clientY);
      if (targetEl !== this.canvas) {
        return;
      }

      const { canvasX, canvasY } = this.domCoordsToCanvasCoords(
        clientX,
        clientY
      );

      if (this.config.graphicType !== WhiteboardGraphicType.Text) {
        this.createCurrentGraphic();
        this.startCurrentDrawing(canvasX, canvasY);

        document.addEventListener('mousemove', this.onMouseMoveHandler, false);
        document.addEventListener('mouseup', this.onMouseUpHandler, false);
      } else if (!this.textEditor || !this.textEditor.isEditing()) {
        if (this.canvas.parentElement) {
          this.createCurrentGraphic();
          this.startCurrentDrawing(canvasX, canvasY);

          const canvasBounds =
            this.canvas.parentElement.getBoundingClientRect();
          const position = {
            left: `${clientX - (canvasBounds.left || 0)}px`,
            top: `${clientY - (canvasBounds.top || 0)}px`,
          };

          if (!this.textEditor) {
            this.textEditor = new TextEditor(
              this.canvas.parentElement,
              position,
              this.onFinishTextEdit,
              this.canvas.getContext('2d')
            );
          } else {
            this.textEditor.updateConfig(position);
          }

          event.preventDefault();
          this.textEditor?.focus();
        }
      }
    }
  }

  private onMouseMoveHandler(event: MouseEvent) {
    logger.log(`${Whiteboard.LOG_PREFIX}.onMouseMoveHandler`);
    if (this.currentGraphic) {
      const { clientX, clientY } = event;
      const { canvasX, canvasY } = this.domCoordsToCanvasCoords(
        clientX,
        clientY
      );
      if (canvasX && canvasY) {
        this.currentGraphic.addPoint(canvasX, canvasY);

        this.draw();
      } else {
        const error = JSON.stringify({
          errorCode: 1001,
          errorMessage: 'canvas坐标计算错误',
        });
        throw Error(error);
      }
    }
  }

  private onMouseUpHandler(event: MouseEvent) {
    logger.log(`${Whiteboard.LOG_PREFIX}.onMouseUpHandler`);
    if (this.currentGraphic) {
      const { clientX, clientY } = event;
      const { canvasX, canvasY } = this.domCoordsToCanvasCoords(
        clientX,
        clientY
      );
      if (canvasX && canvasY) {
        this.currentGraphic.setEndPoint(canvasX, canvasY);
        this.finishCurrentDrawing();
      } else {
        const error = JSON.stringify({
          errorCode: 1001,
          errorMessage: 'canvas坐标计算错误',
        });
        throw Error(error);
      }
    }

    document.removeEventListener('mousemove', this.onMouseMoveHandler, false);
    document.removeEventListener('mouseup', this.onMouseUpHandler, false);
  }

  private draw() {
    logger.log(
      `${Whiteboard.LOG_PREFIX}.draw canvas:`,
      this.canvas,
      this.graphicQueue
    );
    if (this.canvas) {
      const ctx = this.canvas.getContext('2d');
      ctx?.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      this.graphicQueue.forEach(
        (item) => !item.getDeleteFlag() && item.draw(ctx)
      );

      if (this.currentGraphic) {
        this.currentGraphic.draw(ctx);
      }
    }
  }

  private generateRandomColor(): string {
    const red = Math.round(Math.random() * 255);
    const green = Math.round(Math.random() * 255);
    const blue = Math.round(Math.random() * 255);
    const color = `rgb(${red},${green},${blue})`;
    if (this.graphicShadowMap.has(color)) {
      return this.generateRandomColor();
    }
    return color;
  }

  private drawShadow() {
    logger.log(
      `${Whiteboard.LOG_PREFIX}.drawShadow shadowCanvas:`,
      this.shadowCanvas,
      this.graphicQueue,
      this.graphicShadowMap
    );
    if (this.shadowCanvas) {
      const ctx = this.shadowCanvas.getContext('2d');
      ctx?.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      this.graphicQueue.forEach(
        (item) => !item.getDeleteFlag() && item.drawShadow(ctx, {})
      );
    }
  }

  private onClickCanvasHandler(event: MouseEvent) {
    if (this.currentTool !== WhiteboardToolType.Graphic) {
      logger.log(`${Whiteboard.LOG_PREFIX}.onClickCanvasHandler`);
      const { clientX, clientY } = event;
      const { canvasX, canvasY } = this.domCoordsToCanvasCoords(
        clientX,
        clientY
      );
      if (canvasX && canvasY && this.shadowCanvas) {
        const shadowCtx = this.shadowCanvas.getContext('2d');
        if (shadowCtx) {
          const pixel = shadowCtx.getImageData(canvasX, canvasY, 1, 1).data;
          const color = `rgb(${pixel[0]},${pixel[1]},${pixel[2]})`;
          if (this.graphicShadowMap.has(color)) {
            const targetGraphic = this.graphicShadowMap.get(color);
            logger.log(
              `${Whiteboard.LOG_PREFIX}.onClickCanvasHandler 找到有效图形：`,
              targetGraphic,
              this.graphicQueue
            );
            if (
              this.currentTool === WhiteboardToolType.Erase &&
              targetGraphic
            ) {
              this.eraseGraphic(targetGraphic);
            }
          } else {
            logger.error(
              `${Whiteboard.LOG_PREFIX}.onClickCanvasHandler`,
              '点击位置不存在有效图形，color:',
              color,
              this.graphicShadowMap,
              this.graphicQueue
            );
          }
        }
      }
    }
  }

  eraseGraphic(graphicTarget: { graphic: BaseGraphic; index: number }) {
    logger.log(
      `${Whiteboard.LOG_PREFIX}.eraseGraphic args:`,
      graphicTarget,
      this.graphicQueue
    );
    const { graphic, index } = graphicTarget;
    graphic.setDeleteFlag(true);

    this.addAction({
      action: ActionType.Delete,
      index,
    });

    this.draw();
    this.drawShadow();
  }

  /**
   * 多次 undo 操作之后，如果进行一次绘图或者删除操作，则通过 undo 操作回退的操作丢失（即不能再通过 redo 找回）。
   *
   * 说明示例: D 表示绘图操作（也可以时删除图形操作）；方括号，表示可以 redo 找回的操作。
   *  操作：D1
   *  队列：D1
   *
   *  操作：D1 -> D2
   *  队列：D1, D2
   *
   *  操作：D1 -> D2 -> D3
   *  队列：D1, D2, D3
   *
   *  操作：D1 -> D2 -> D3 -> undo
   *  队列：D1, D2, [D3]                    // 方括号中，表示可以 redo 找回的操作
   *
   *  操作：D1 -> D2 -> D3 -> undo -> undo
   *  队列：D1, [D2, D3]                    // 方括号中，表示可以 redo 找回的操作
   *
   *  操作：D1 -> D2 -> D3 -> undo -> undo -> D4
   *  队列：D1, D4                          // 此时没有可以支持 redo 的操作
   */
  undo() {
    if (this.currentActionMemeIndex >= 0) {
      const actionMeme = this.actionMemeQueue[this.currentActionMemeIndex];
      const { action, index } = actionMeme;
      switch (action) {
        case ActionType.Draw:
          this.graphicQueue[index].setDeleteFlag(true);
          // eslint-disable-next-line no-plusplus
          this.currentActionMemeIndex--;
          this.draw();
          this.drawShadow();
          break;
        case ActionType.Delete:
          this.graphicQueue[index].setDeleteFlag(false);
          // eslint-disable-next-line no-plusplus
          this.currentActionMemeIndex--;
          this.draw();
          this.drawShadow();
          break;
        default:
          logger.log(`${Whiteboard.LOG_PREFIX}.undo unknown action`);
      }
    }
  }

  redo() {
    const actionMeme = this.actionMemeQueue[this.currentActionMemeIndex + 1];
    if (actionMeme) {
      const { action, index } = actionMeme;
      switch (action) {
        case ActionType.Draw:
          this.graphicQueue[index].setDeleteFlag(false);
          // eslint-disable-next-line no-plusplus
          this.currentActionMemeIndex++;
          this.draw();
          this.drawShadow();
          break;
        case ActionType.Delete:
          this.graphicQueue[index].setDeleteFlag(true);
          // eslint-disable-next-line no-plusplus
          this.currentActionMemeIndex++;
          this.draw();
          this.drawShadow();
          break;
        default:
          logger.log(`${Whiteboard.LOG_PREFIX}.redo unknown action`);
      }
    }
  }

  destroy() {
    this.unregisterEventListener();
    this.canvas = null;
    this.shadowCanvas = null;
    this.graphicQueue = [];
    this.graphicShadowMap?.clear();

    this.destroyTextEditor();
  }

  downloadImage() {
    if (this.canvas && this.shadowCanvas) {
      const dataUrl = this.canvas.toDataURL();
      const shadowDataUrl = this.shadowCanvas.toDataURL();
      const random = Math.floor(Math.random() * 10000);

      const a = document.createElement('a');
      a.style.display = 'none';
      a.setAttribute('href', dataUrl);
      a.setAttribute('download', `origin-${random}`);
      document.body.appendChild(a);
      a.click();

      const sa = document.createElement('a');
      sa.style.display = 'none';
      sa.setAttribute('href', shadowDataUrl);
      sa.setAttribute('download', `shadow-${random}`);
      document.body.appendChild(sa);
      sa.click();

      setTimeout(() => {
        document.body.removeChild(a);
        document.body.removeChild(sa);
      }, 0);
    }
  }
}

export default Whiteboard;
