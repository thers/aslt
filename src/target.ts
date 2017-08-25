import { Game } from './cfx/game'
import { Text } from './cfx/text'
import { Rect } from './cfx/rect'
import { Color, Known } from './cfx/color'
import { Marker, MarkerType } from './cfx/marker'
import { Vector3 } from './cfx/vector'

export enum TargetState {
    Awaiting,
    Idle,
    BeingCaptured,
    Captured
}

export class Target {
    private position: Vector3;
    private radius: number;
    private blip: number;

    private state: TargetState = TargetState.Awaiting;
    private timeLeft: number;

    private marker: Marker;

    public constructor(
        private timeLimit: number = 5000,
        radius: number = 10
    ) {
        this.radius = radius * radius;
        this.timeLeft = timeLimit;
    }

    public isNear(pos: Vector3) {
        return this.position.distanceSquared(pos) < this.radius;
    }

    public spawn(pos: Vector3) {
        this.position = pos;
        const radius = Math.sqrt(this.radius);
        const mult = 1.975;

        const scale = radius * mult;

        this.blip = AddBlipForCoord(
            this.position.x,
            this.position.y,
            this.position.z
        );

        this.marker = new Marker(
            this.position.add(new Vector3(0, 0, -9)),
            this.radius,
            MarkerType.VerticalCylinder,
            Known.PaleRed,
            Vector3.Forward,
            Vector3.Zero,
            new Vector3(scale, scale, 10)
        );

        this.marker.direction = Vector3.Forward;

        SetBlipSprite(this.blip, 63);
        SetBlipScale(this.blip, 1.1);

        setTimeout(() => this.state = TargetState.Idle, 1000);
    }

    public delete() {
        RemoveBlip(this.blip);
    }

    private checkPlayersInside() {
        let i = 0;
    
        for (const player of Game.getPlayers()) {
            if (player.position.distanceSquared(this.position) < this.radius) {
                i++;
            }
        }

        // TODO: Contesting
        if (i > 0) {
            this.state = TargetState.BeingCaptured;
        } else {
            this.state = TargetState.Idle;
        }
    }

    private timeLeftHuman(): string {
        const minutes = (this.timeLeft / 1000 / 60) % 60 |0;
        const seconds = (this.timeLeft / 1000) % 60 |0;

        return `${minutes}:${seconds}`;
    }

    public update(dt: number, time: number) {
        switch (this.state) {
            case TargetState.Idle:
                this.checkPlayersInside();

                this.marker.color = Known.MarineBlue;
                break;
                
            case TargetState.BeingCaptured:
                this.checkPlayersInside();

                this.timeLeft -= dt;

                if (this.timeLeft <= 0) {
                    this.state = TargetState.Captured;
                }

                this.marker.color = Known.WeirdPurple;
                break;

            case TargetState.Captured:
                this.marker.color = Known.Green;
        }

        this.updateHud(dt, time);
    }

    public updateHud(dt: number, time: number) {
        this.marker.draw();
    }

    public toString(): string {
        return `state: ${TargetState[this.state]}, timer: ${this.timeLeftHuman()}`;
    }
}
