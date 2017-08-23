import { Game } from './game'
import { Color, Known } from './color'

export enum Font {
    ChaletLondon,
    HouseScript,
    Monospace,
    ChaletComprimeCologne = 4,
    Pricedown = 7
}

export enum Alignment {
    Center = 0,
    Left = 1,
    Right = 2,
}

export class Text {
    public alignment: Alignment = Alignment.Center;
    public shadow: boolean = false;
    public outline: boolean = false;

    public shadowDistance: number = 0;
    public shadowColor: Color = Known.Black;

    public constructor(
        public caption: string,
        public position: [number, number],
        public scale: number = 1.0000001,
        public color: Color = Known.White,
        public font: Font = Font.ChaletComprimeCologne
    ) { }

    public draw() {
        if (this.shadow) {
            SetTextDropshadow(
                this.shadowDistance + 0.01,
                this.shadowColor.r,
                this.shadowColor.g,
                this.shadowColor.b,
                this.shadowColor.a
            );
        }

        if (this.outline) {
            SetTextOutline();
        }

        SetTextFont(<number>this.font);
        SetTextScale(this.scale, this.scale);
        SetTextColour(this.color.r, this.color.g, this.color.b, this.color.a);
        SetTextJustification(<number>this.alignment);

        SetTextEntry("STRING");
        AddTextComponentString(this.caption);

        DrawText(this.position[0] + 0.0000001, this.position[1] + 0.0000001);
    }
}
