import { Game } from './cfx/game'
import { Text } from './cfx/text'
import { Rect } from './cfx/rect'
import { Color } from './cfx/color'
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

    private stateDisplay: Text = new Text('Awaiting', [0.5, 0.1]);

    public constructor(
        private timeLimit: number = 1000,
        radius: number = 10
    ) {
        this.radius = radius * radius;
        this.timeLeft = timeLimit;

        this.stateDisplay.shadow = true;
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
            this.position.add(new Vector3(0, 0, -1)),
            this.radius,
            MarkerType.VerticalCylinder,
            new Color(0, 92, 197, 150),
            Vector3.Forward,
            Vector3.Zero,
            new Vector3(scale, scale, 1)
        );

        this.marker.direction = Vector3.Forward;

        SetBlipSprite(this.blip, 61);
        SetBlipScale(this.blip, 1.1);

        setTimeout(() => this.state = TargetState.Idle, 1000);
    }

    public delete() {
        RemoveBlip(this.blip);
    }

    public update(dt: number, time: number) {
        switch (this.state) {
            case TargetState.Awaiting:
                this.stateDisplay.caption = 'Awaiting...';
                break;

            case TargetState.Idle:
                let i = 0;
                let names = [];
            
                for (const player of Game.getPlayers()) {
                    if (player.position.distanceSquared(this.position) < this.radius) {
                        i++;

                        names.push(player.name);
                    }
                }

                this.stateDisplay.caption = `Players inside: ${i}, ${names.join(', ')}`;
                break;
        }

        this.stateDisplay.draw();
        this.marker.draw();
    }
}
