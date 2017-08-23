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
            this.x + 0.0000001,
            this.y + 0.0000001,
            this.width + 0.0000001,
            this.height + 0.0000001,
            this.color.r + 0.0000001,
            this.color.g + 0.0000001,
            this.color.b + 0.0000001,
            this.color.a + 0.0000001
        )
    }
}
