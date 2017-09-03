import { Color, Known } from './color'

export class Sprite {
    private ready = false;

    public constructor(
        public pos: [number, number],
        public tex: [string, string],
        public size: [number, number],
        public heading: number = 0,
        public color: Color = Known.White
    ) {
        RequestStreamedTextureDict(tex[0], true);
    }

    public get hasLoaded(): boolean {
        return !!HasStreamedTextureDictLoaded(this.tex[0]);
    }

    public draw() {
        if (!this.ready) {
            if (this.hasLoaded) {
                this.ready = true;
            } else {
                RequestStreamedTextureDict(this.tex[0], true);
                return;
            }
        }

        DrawSprite(
            this.tex[0], this.tex[1],
            this.pos[0], this.pos[1],
            this.size[0], this.size[1],
            this.heading,
            this.color.r,
            this.color.g,
            this.color.b,
            this.color.a
        );
    }
}
