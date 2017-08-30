import { Game } from './cfx/game'
import { Text } from './cfx/text'
import { Rect } from './cfx/rect'
import { Color, Known } from './cfx/color'
import { Marker, MarkerType } from './cfx/marker'
import { Vector3 } from './cfx/vector'
import { projectToGame } from './position'
import { nextFloat } from './proceduralRandom'
import StateHolder from './state'

function playerPosFromPlayerId(playerId: string): Vector3 {
    const pos = GetEntityCoords(
        GetPlayerPed(
            GetPlayerFromServerId(parseInt(playerId, 10))
        ),
        true
    );

    return Vector3.from(pos);
}

export enum TargetLocalState {
    Idle,
    Capturing,
    Contested
}

export class Target {
    public state: TargetLocalState = TargetLocalState.Idle;

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
        this.state = TargetLocalState.Idle;

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
        let playersOnTarget = 0;

        const localPlayerId = PlayerId();
        const localPlayerOnTarget = this.isPosWithin(Game.localPlayer.position);

        if (localPlayerOnTarget && !this.localPlayerWasOnTarget) {
            StateHolder.notifyPlayerInside();
            this.localPlayerWasOnTarget = true;
        }

        if (!localPlayerOnTarget && this.localPlayerWasOnTarget) {
            StateHolder.notifyPlayerOutside();
            this.localPlayerWasOnTarget = false;
        }

        const teamsMembersOnTarget = {};

        for (const playerId of Object.keys(StateHolder.state.playersAtTarget)) {
            let isOnTarget = StateHolder.state.playersAtTarget[playerId];
            const playerTeam = StateHolder.getPlayerTeam(playerId);
            
            // In order to improve visible perf we can check locally
            if (!isOnTarget) {
                isOnTarget = this.isPosWithin(
                    playerPosFromPlayerId(playerId)
                );
            }

            // Same we can check it for local player
            if (parseInt(playerId, 10) === localPlayerId) {
                isOnTarget = localPlayerOnTarget;
            }

            if (isOnTarget) {
                playersOnTarget++;

                if (typeof teamsMembersOnTarget[playerTeam] === "undefined") {
                    teamsMembersOnTarget[playerTeam] = 1;
                } else {
                    teamsMembersOnTarget[playerTeam] += 1;
                }
            }
        }

        let contested = true;
        const meanTeamsMembersOnTarget = playersOnTarget / 2; // 2 teams in total

        for (const teamId of Object.keys(teamsMembersOnTarget)) {
            if (teamsMembersOnTarget[teamId] !== meanTeamsMembersOnTarget) {
                contested = false;
            }
        }

        switch (true) {
            case playersOnTarget === 0:
                this.state = TargetLocalState.Idle;
                this.marker.color = Known.Green;
                break;
            
            case contested:
                this.state = TargetLocalState.Contested;
                this.marker.color = Known.PaleRed;
                break;

            case playersOnTarget > 0:
                this.state = TargetLocalState.Capturing;
                this.marker.color = Known.Blue;
                break;
        }
    }

    private isPosWithin(pos: Vector3): boolean {
        const distance2D = pos.distanceSquared2D(this.position);
        const distanceZ = Math.abs(pos.z - this.position.z);

        return (
            distance2D < this._radius
            && distanceZ < this._zThreshold
        );
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
