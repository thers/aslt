import { Target, TargetState } from './target'
import { Text, Font, Alignment } from './cfx/text'
import { Color, Known } from './cfx/color'
import { Vector3 } from './cfx/vector'
import { Game } from './cfx/game'

export enum RoundState {
    Idle,
    Starting,
    Intermission,
    Running
}

const statusText = new Text('wtf', [0.5, 0.05], .5, Known.White, Font.ChaletLondon);
statusText.outline = true;
statusText.alignment = Alignment.Center;

export class Round {
    public target: Target = null;
    public targetIndex: number = 1;
    public maxTargets: number = 2;

    public teams: Set<Team> = new Set();
    public state: RoundState = RoundState.Idle;

    public timeToStart: number = 20000;
    public timeToNextTarget: number = 30000;

    public timerToStart: number;
    public timerToNextTarget: number;

    public start() {
        this.timerToStart = this.timeToStart;
        this.timerToNextTarget = this.timeToNextTarget;

        this.target && this.target.cleanUp();

        this.target = new Target();
        this.targetIndex = 1;

        this.state = RoundState.Starting;
    }

    public stop() {
        this.target.cleanUp();

        this.state = RoundState.Idle;
    }

    public update(dt: number, time: number) {
        switch (this.state) {
            case RoundState.Idle:
                return;

            case RoundState.Starting:
                this.timerToStart -= dt;

                if (this.timerToStart <= 0) {
                    this.state = RoundState.Running;
                    this.target.respawn();
                    this.timerToStart = 0;
                }
                break;

            case RoundState.Intermission:
                this.updateIntermission(dt);
                break;
            
            case RoundState.Running:
                this.updateRunning(dt, time);
                break;
        }

        this.updateUi();
    }

    private updateIntermission(dt: number) {
        this.timerToNextTarget -= dt;

        if (this.timerToNextTarget <= 0) {
            this.target.respawn();
            this.state = RoundState.Running;

            this.timerToNextTarget = this.timeToNextTarget;
        }
    }

    private updateRunning(dt: number, time: number) {
        this.target.update(dt);

        if (this.target.state === TargetState.Captured) {
            this.targetIndex++;

            if (this.targetIndex <= this.maxTargets) {
                this.state = RoundState.Intermission;
            } else {
                this.stop();
            }
        }
    }

    public updateUi() {
        switch (this.state) {
            case RoundState.Starting:
                statusText.caption = `Time to start: ${humanize(this.timerToStart)}`;
                break;

            case RoundState.Intermission:
                statusText.caption = `Intermission: ${humanize(this.timerToNextTarget)}`;
                break;

            case RoundState.Running:
                statusText.caption = `Target: ${this.targetIndex}, `;
                statusText.caption = TargetState[this.target.state];

                switch (this.target.state) {
                    case TargetState.Idle:
                    case TargetState.BeingCaptured:
                        statusText.caption = `time left: ${humanize(this.target.timeLeft)}`;
                        break;
                }
                break;
        }

        statusText.draw();
    }
}

export class Team {

}



function humanize(time: number): string {
    return (time / 1000).toFixed(1);
}
