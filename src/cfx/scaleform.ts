import { Vector3 } from './vector'

export class Scaleform {
    private ready = false;
    private handle: number;

    public get hasLoaded(): boolean {
        return !!HasScaleformMovieLoaded(this.handle);
    }

    public get isValid(): boolean {
        return this.handle !== 0;
    }

    public get isReady(): boolean {
        if (!this.ready) {
            if (!this.hasLoaded) {
                this.tryAcquireHandle();
            } else {
                this.ready = true;
            }
        }

        return this.ready;
    }

    public constructor(
        private name: string
    ) {
        this.tryAcquireHandle();
    }

    private tryAcquireHandle() {
        this.handle = RequestScaleformMovie(this.name);
    }

    public delete() {
        SetScaleformMovieAsNoLongerNeeded(this.handle);
    }

    public invoke(name: string, ...args: any[]) {
        if (!this.isReady) {
            return;
        }

        PushScaleformMovieFunction(this.handle, name);

        for (const arg of args) {
            switch (true) {
                case typeof arg === 'number':
                    // Float as it's easier than trying to distinguish int from float
                    PushScaleformMovieFunctionParameterFloat(arg);
                    break;

                case typeof arg === 'string':
                    BeginTextComponent('STRING');
                    AddTextComponentSubstringPlayerName(arg.toString());
                    EndTextComponent();
                    break;

                case typeof arg === 'boolean':
                    PushScaleformMovieFunctionParameterBool(arg);
                    break;

                default:
                    console.error('U mad? arg type: ', typeof arg);
                    throw new Error('Invalid argument type to pass to GFx');
            }
        }

        PopScaleformMovieFunctionVoid();
    }

    public render2d() {
        DrawScaleformMovieFullscreen(this.handle, 255, 255, 255, 255, 0);
    }

    public render2dScreenSpace(x: number, y: number, w: number, h: number) {
        DrawScaleformMovie(this.handle, x, y, w, h, 255, 255, 255, 255, 0);
    }

    public render3d(pos: Vector3, rot: Vector3, scale: Vector3) {
        DrawScaleformMovie_3dNonAdditive(
            this.handle,
            pos.x, pos.y, pos.z,
            rot.x, rot.y, rot.z,
            2, 2, 2,
            scale.x, scale.y, scale.z,
            2
        );
    }

    public render2dAdditive(pos: Vector3, rot: Vector3, scale: Vector3) {
        DrawScaleformMovie_3d(
            this.handle,
            pos.x, pos.y, pos.z,
            rot.x, rot.y, rot.z,
            2, 2, 2,
            scale.x, scale.y, scale.z,
            2
        );
    }
}
