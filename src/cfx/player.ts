import { Vector3 } from './vector'

export class Player {
    public constructor(private handle: number) { }

    public get ped(): number {
        return GetPlayerPed(this.handle);
    }

    public get name(): string {
        return GetPlayerName(this.handle);
    }

    public get position(): Vector3 {
        return Vector3.from(GetEntityCoords(this.ped, true));
    }

    public get alive(): boolean {
        return !!IsPedDeadOrDying(this.ped, true);
    }
    
    public setFloatDecor(decor: string, value: number) {
        DecorSetFloat(this.ped, decor, value);
    }
    
    public setIntDecor(decor: string, value: number) {
        DecorSetInt(this.ped, decor, value|0);
    }
    
    public setBoolDecor(decor: string, value: boolean) {
        DecorSetBool(this.ped, decor, value);
    }

    public getFloatDecor(decor: string): number {
        return DecorGetFloat(this.ped, decor);
    }
        
    public getIntDecor(decor: string): number {
        return DecorGetInt(this.ped, decor);
    }
    
    public getBoolDecor(decor: string): boolean {
        return !!DecorGetBool(this.ped, decor);
    }
}
