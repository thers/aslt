import { Vector3 } from './vector'
import { Game } from './game'

export class Camera {
    protected handle: number;
    
    public get pos(): Vector3 {
        return Vector3.from(
            GetCamCoord(this.handle)
        );
    }

    public set pos(pos: Vector3) {
        SetCamCoord(this.handle, pos[0], pos[1], pos[2]);
    }

    public get rot(): Vector3 {
        return Vector3.from(
            GetCamRot(this.handle, 2)
        );
    }

    public set rot(value: Vector3) {
        SetCamRot(this.handle, value.x, value.y, value.z, 2);
    }

    public get fov(): number {
        return GetCamFov(this.handle);
    }

    public set fov(value: number) {
        if (value < 1) {
            value = 1.0001;
        }

        if (value > 130) {
            value = 129.9999;
        }

        SetCamFov(this.handle, value);
    }

    public get nearClip(): number {
        return GetCamNearClip(this.handle);
    }

    public get farClip(): number {
        return GetCamFarClip(this.handle);
    }

    public constructor(pos: Vector3, rot: Vector3, fov: number) {
        this.handle = CreateCamWithParams(
            "DEFAULT_SCRIPTED_CAMERA",
            pos.x, pos.y, pos.z,
            rot.x, rot.y, rot.z,
            fov, true, 2
        );

        console.log(`Created camera: ${this.handle}`);

        Game.onUnmount(() => {
            DestroyCam(this.handle, false);
        });
    }

    public enable(ease: boolean = false, easeTime: number = 1000) {
        RenderScriptCams(true, ease, easeTime, false, false);
    }

    public disable(ease: boolean = false, easeTime: number = 1000) {
        RenderScriptCams(false, ease, easeTime, false, false);
    }
    
    public pointAtEntity(entity: number) {
        PointCamAtEntity(this.handle, entity, 0.1, 0.1, 0.1, true);
    }
}
