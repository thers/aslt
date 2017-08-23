import { Vector3 } from './vector'
import { Color, Known } from './color'

export enum MarkerType {
    UpsideDownCone,
    VerticalCylinder,
    ThickChevronUp,
    ThinChevronUp,
    CheckeredFlagRect,
    CheckeredFlagCircle,
    VerticleCircle,
    PlaneModel,
    LostMCDark,
    LostMCLight,
    Number0,
    Number1,
    Number2,
    Number3,
    Number4,
    Number5,
    Number6,
    Number7,
    Number8,
    Number9,
    ChevronUpx1,
    ChevronUpx2,
    ChevronUpx3,
    HorizontalCircleFat,
    ReplayIcon,
    HorizontalCircleSkinny,
    HorizontalCircleSkinnyArrow,
    HorizontalSplitArrowCircle,
    DebugSphere
}

export class Marker {
    public constructor(
        public position: Vector3,
        public radius: number,
        public type: MarkerType,
        public color: Color,
        public direction: Vector3 = Vector3.Up,
        public rotation: Vector3 = Vector3.Zero,
        public scale: Vector3 = Vector3.Identity,
        public bobUpAndDown: boolean = false,
        public faceCamera: boolean = false,
        public textureDict: string = null,
        public textureName: string = null,
        public drawOnEntity: boolean = false,
        public rotateY: boolean = false
    ) { }

    public draw() {
        DrawMarker(
            <number>this.type,
            this.position.x,
            this.position.y,
            this.position.z,
            this.direction.x,
            this.direction.y,
            this.direction.z,
            this.rotation.x,
            this.rotation.y,
            this.rotation.z,
            this.scale.x,
            this.scale.y,
            this.scale.z,
            this.color.r,
            this.color.g,
            this.color.b,
            this.color.a,
            this.bobUpAndDown,
            this.faceCamera,
            2,
            this.rotateY,
            this.textureDict,
            this.textureName,
            this.drawOnEntity
        );
    }
}
