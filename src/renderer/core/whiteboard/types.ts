export enum WhiteboardToolType {
  Graphic = 1,
  Mouse = 2,
  Erase = 3,
}

export enum WhiteboardGraphicType {
  Line = 1,
  Curve = 2,
  Rect = 3,
  Ellipse = 4,
  Text = 5,
}

export enum DrawModeType {
  Fill = 1,
  Stroke = 2,
}

export type GraphicConfig = {
  color?: string;
  lineWidth?: number;
  mode?: DrawModeType;
  shadowColor?: string;
  graphicType?: WhiteboardGraphicType;
};
