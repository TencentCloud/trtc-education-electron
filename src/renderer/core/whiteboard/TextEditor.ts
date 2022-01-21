import logger from '../../utils/logger';
import WhiteboardConstant from './constant';

class TextEditor {
  static LOG_PREFIX = '[WB-TextEditor]';

  static defaultConfig = {
    position: 'absolute',
    display: 'block',
    width: '100px',
    height: `${WhiteboardConstant.DEFAULT.LINE_HEIGHT}px`,
    font: WhiteboardConstant.DEFAULT.FONT,
    border: 'none',
    padding: '0',
    outline: '1px dashed red',
    overflow: 'hidden',
  };

  private textarea: HTMLTextAreaElement | null;

  private parentEl: HTMLElement | null;

  private canvasCtx: CanvasRenderingContext2D | null;

  private finishEditCallback: (text: string) => void | null;

  constructor(
    container: HTMLElement,
    config: Record<string, string>,
    finishEditCallback: (text: string) => void,
    canvasContext: CanvasRenderingContext2D | null
  ) {
    this.parentEl = container;
    this.finishEditCallback = finishEditCallback;
    this.canvasCtx = canvasContext;
    this.textarea = document.createElement('textarea');
    const realConfig = { ...config, ...TextEditor.defaultConfig };
    Object.entries(realConfig).forEach(([key, value]) => {
      // @ts-ignore
      this.textarea.style[key] = value;
    });
    this.parentEl.appendChild(this.textarea);

    this.onInput = this.onInput.bind(this);
    this.onFinishEdit = this.onFinishEdit.bind(this);
    this.registerEventListener();
  }

  onInput(event: Event) {
    if (this.textarea && this.canvasCtx) {
      const { target } = event;
      if (target) {
        // @ts-ignore
        const text = target.value;
        let width = 100;
        const lines = text.split('\n');
        this.canvasCtx.font = WhiteboardConstant.DEFAULT.FONT;
        lines.forEach((line: string) => {
          const textMetrics = this.canvasCtx?.measureText(line);
          if (textMetrics && textMetrics.width > width) {
            width = textMetrics.width;
          }
        });
        // @ts-ignore
        target.style.width = `${width}px`;
        // @ts-ignore
        target.style.height = `${
          lines.length * WhiteboardConstant.DEFAULT.LINE_HEIGHT
        }px`;
      }
    } else {
      logger.error(`${TextEditor.LOG_PREFIX}.onInput error`);
    }
  }

  onFinishEdit(event: MouseEvent) {
    if (this.textarea && this.isEditing()) {
      const { clientX, clientY } = event;
      const clickedEl = document.elementFromPoint(clientX, clientY);
      if (this.textarea !== clickedEl) {
        if (this.finishEditCallback) {
          this.finishEditCallback(this.textarea.value);
          this.textarea.value = '';
          this.textarea.style.display = 'none';
        }
      }
    }
  }

  registerEventListener() {
    if (this.textarea) {
      this.textarea.addEventListener('input', this.onInput, false);
    }
    document.addEventListener('click', this.onFinishEdit, false);
  }

  unregisterEventListener() {
    document.removeEventListener('click', this.onFinishEdit, false);
    if (this.textarea) {
      this.textarea.removeEventListener('input', this.onInput, false);
    }
  }

  updateConfig(config: Record<string, string>) {
    const realConfig = { ...config, ...TextEditor.defaultConfig };
    Object.entries(realConfig).forEach(([key, value]) => {
      // @ts-ignore
      this.textarea.style[key] = value;
    });
  }

  focus() {
    if (this.textarea) {
      this.textarea.style.display = 'block';
    }
    setTimeout(() => {
      this.textarea?.focus();
    }, 1000);
  }

  hide() {
    if (this.textarea) {
      this.textarea.style.display = 'none';
    }
  }

  isEditing() {
    if (this.textarea) {
      return this.textarea.style.display !== 'none';
    }
    return false;
  }

  reset() {
    if (this.textarea) {
      Object.entries(TextEditor.defaultConfig).forEach(([key, value]) => {
        // @ts-ignore
        this.textarea.style[key] = value;
      });
    }
  }

  destroy() {
    this.unregisterEventListener();
    this.canvasCtx = null;
    this.parentEl = null;
    this.textarea = null;
  }
}

export default TextEditor;
