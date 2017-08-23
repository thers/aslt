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
}
