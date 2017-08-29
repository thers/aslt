import { Game } from './cfx/game'
import { Text } from './cfx/text'
import { Rect } from './cfx/rect'
import { Color, Known } from './cfx/color'
import { Marker, MarkerType } from './cfx/marker'
import { Vector3 } from './cfx/vector'
import { projectToGame } from './position'
import { nextFloat } from './proceduralRandom'
import StateHolder from './state'

function playerPosFromServerId(playerId: number): Vector3 {
    const pos = GetEntityCoords(
        GetPlayerPed(
            GetPlayerFromServerId(playerId)
        ),
        true
    );

    return Vector3.from(pos);
}

export class Target {
    public position: Vector3;

    private blip: number;
    private marker: Marker;
    private positionFixed: boolean;

    private _radius: number;
    private _radiusOrig: number;
    private _zFixRadius = 150 * 150;
    private _zThreshold: number;

    private localPlayerWasOnTarget: boolean = false;

    public get radius(): number {
        return this._radiusOrig;
    }

    public set radius(radius: number) {
        this._radius = radius * radius;
        this._radiusOrig = radius;
    }

    public constructor(radius: number = 10.1) {
        this.radius = radius;
        this._zThreshold = radius * 3;
    }

    /**
     * @api
     * @param pos 
     */
    public respawn() {
        this.position = this.randomPos();
        this.positionFixed = false;

        this.blip && RemoveBlip(this.blip);

        const mult = 1.975;
        const scale = this._radiusOrig * mult;

        this.blip = AddBlipForCoord(
            this.position.x,
            this.position.y,
            this.position.z
        );

        this.marker = new Marker(
            this.position.add(new Vector3(0, 0, -9)),
            this._radiusOrig,
            MarkerType.VerticalCylinder,
            Known.PaleRed,
            Vector3.Forward,
            Vector3.Zero,
            new Vector3(scale, scale, 10)
        );

        this.marker.direction = Vector3.Forward;

        SetBlipSprite(this.blip, 419);
        SetBlipScale(this.blip, 1.1);
    }

    /**
     * @api
     */
    public cleanUp() {
        RemoveBlip(this.blip);
    }

    /**
     * @api
     * @param dt 
     * @param time 
     */
    public update(dt: number) {
        this.checkPlayersInside(dt);

        this.updateHud(dt);
    }
    
    private checkPlayersInside(dt: number) {
        const playerPos = Game.localPlayer.position;
        const distance2D = playerPos.distanceSquared2D(this.position);
        const distanceZ = Math.abs(playerPos.z - this.position.z);

        const nowOnTarget = distance2D < this._radius && distanceZ < this._zThreshold;

        if (nowOnTarget && !this.localPlayerWasOnTarget) {
            StateHolder.notifyPlayerInside();
            this.localPlayerWasOnTarget = true;
        }

        if (!nowOnTarget && this.localPlayerWasOnTarget) {
            StateHolder.notifyPlayerOutside();
            this.localPlayerWasOnTarget = false;
        }
    }

    private updateHud(dt: number) {
        const playerPos = Game.localPlayer.position;
        const dist2D = playerPos.distanceSquared2D(this.position);

        if (dist2D < this._zFixRadius) {
            if (!this.positionFixed) {
                this.fixZCoord(playerPos);
            }

            this.marker.draw();
        }
    }

    /**
     * Fixes Z coord of a target
     * This is due to the fact that
     * there might be no Z coord loaded
     * for given coord at all
     * 
     * @param playerPos 
     */
    private fixZCoord(playerPos: Vector3) {
        const x = this.position.x;
        const y = this.position.y;
        const z = playerPos.z + 100;
        const r = this._radiusOrig;

        if (!GetGroundZFor_3dCoord(x, y, z, true)[0]) {
            return;
        }

        const surroundingArea = [
            this.tryFixZCoord(x, y, z),
            this.tryFixZCoord(x - r, y - r, z),
            this.tryFixZCoord(x - r, y + r, z),
            this.tryFixZCoord(x + r, y - r, z),
            this.tryFixZCoord(x + r, y + r, z)
        ];

        const newZ = Math.min(...surroundingArea);

        this.positionFixed = true;
        this.position.z = newZ;
        this.marker.position.z = newZ;

        SetBlipCoords(this.blip, x, y, z);
    }

    private tryFixZCoord(x: number, y: number, z: number): number {
        const [res, newZ] = GetGroundZFor_3dCoord(
            x, y, z,
            false
        );

        return res ? newZ : z;
    }

    private randomPos(): Vector3 {
        let pos;

        do {
            pos = this.generateNewPos();
        } while (this.inOcean(pos));

        return pos;
    }

    private generateNewPos(): Vector3 {
        return projectToGame(nextFloat(), nextFloat(), 0);
    }

    private inOcean(pos: Vector3): boolean {
        return GetNameOfZone(pos.x, pos.y, pos.z) === 'OCEANA';
    }
}
