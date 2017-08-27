import { Color } from './color'

export class Rect {
    public constructor(
        public x: number,
        public y: number,
        public width: number,
        public height: number,
        public color: Color
    ) { }

    public draw() {
        DrawRect(
            this.x,
            this.y,
            this.width,
            this.height,
            this.color.r,
            this.color.g,
            this.color.b,
            this.color.a
        )
    }
}
