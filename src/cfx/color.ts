export class Color {
    public constructor(
        public r: number,
        public g: number,
        public b: number,
        public a: number
    ) { }

    public toArray(): [number, number, number, number] {
        return [this.r, this.g, this.b, this.a];
    }

    public static fromRgb(rgb: number) {
        var r = rgb >> 16;
        var g = (rgb & 0x00ff00) >> 8;
        var b = rgb & 0x0000ff;

        return new Color(r, g, b, 255);
    }

    public static alterAlpha(c: Color, a: number) {
        return new Color(c.r, c.g, c.b, a);
    }
}

export const Known = {
    White: Color.fromRgb(0xffffff),
    Black: Color.fromRgb(0),
    Red: Color.fromRgb(0xff0000),
    Green: Color.fromRgb(0x00ff00),
    Blue: Color.fromRgb(0x0000ff),
    MarineBlue: Color.fromRgb(0x005cc5),
    PaleRed: Color.fromRgb(0xd73a49),
    WeirdPurple: Color.fromRgb(0x373277)
};
