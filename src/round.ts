import { Target, TargetState } from './target'
import { Text, Font, Alignment } from './cfx/text'
import { Color, Known } from './cfx/color'
import { Vector3 } from './cfx/vector'
import { Player } from './cfx/player'
import { Game } from './cfx/game'

export enum RoundState {
    Idle,
    Starting,
    Intermission,
    Running,
    Ended
}

const statusText = new Text('wtf', [0.5, 0.05], .5, Known.White, Font.ChaletLondon);
statusText.outline = true;
statusText.alignment = Alignment.Center;

export class Round {
    public target: Target = null;
    public targetIndex: number = 1;
    public maxTargets: number = 2;

    public state: RoundState = RoundState.Idle;
    public teamsScore = [0, 0];

    public timeToStart: number = 5000;
    public timeToNextTarget: number = 5000;

    public timerToStart: number;
    public timerToNextTarget: number;

    public start() {
        this.teamsScore = [0, 0];
        this.timerToStart = this.timeToStart;
        this.timerToNextTarget = this.timeToNextTarget;

        this.target && this.target.cleanUp();

        this.target = new Target();
        this.targetIndex = 1;

        this.state = RoundState.Starting;

        Game.localPlayer.setFloatDecor('aslt_random', Math.random());
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
                    this.transitionToRunning();
                }
                break;

            case RoundState.Intermission:
                this.updateIntermission(dt);
                break;
            
            case RoundState.Running:
                this.updateRunning(dt);
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

    private updateRunning(dt: number) {
        this.target.update(dt);

        if (this.target.state === TargetState.Captured) {
            if (this.target.teamsProgress[0] > this.target.teamsProgress[1]) {
                this.teamsScore[0]++;
            } else {
                this.teamsScore[1]++;
            }

            this.targetIndex++;

            if (this.targetIndex <= this.maxTargets) {
                this.state = RoundState.Intermission;
            } else {
                this.stop();
            }
        }
    }

    private transitionToRunning() {
        const players = [];

        for (const player of Game.getPlayers()) {
            players.push([
                player,
                player.getFloatDecor('aslt_random')
            ]);
        }

        players.sort((a, b) => a[1] - b[1])
            .forEach(([player], index) => (<Player>player).setIntDecor(
                'aslt_team',
                (index % 2 === 0) ? 0 : 1 // There could be more teams, so fu
            ));

        this.state = RoundState.Running;
        this.target.respawn();
        this.timerToStart = 0;
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
                        statusText.caption = `Time remaining on target #${this.targetIndex}: ${humanize(this.target.timeLeft)}`;
                        break;
                }
                break;
        }

        statusText.caption += ', team: ' + Game.localPlayer.getIntDecor('aslt_team');
        statusText.draw();
    }
}

function humanize(time: number): string {
    return (time / 1000).toFixed(1);
}
