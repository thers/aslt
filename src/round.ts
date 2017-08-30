import { Text, Font, Alignment } from './cfx/text'
import { Color, Known } from './cfx/color'
import { Vector3 } from './cfx/vector'
import { Player } from './cfx/player'
import { Game } from './cfx/game'
import { Target, TargetLocalState } from './target'
import { setSeed, advanceSeed } from './proceduralRandom'
import StateHolder, {
     Transition,
     RoundState
} from './state'

const statusText = new Text('wtf', [0.5, 0.05], .5, Known.White, Font.ChaletLondon);
statusText.outline = true;
statusText.alignment = Alignment.Center;

export class Round {
    public target: Target = new Target();

    public constructor() {
        StateHolder.onSync(transition => {
            switch (transition) {
                case Transition.Initial:
                    this.initialize();
                    break;

                case Transition.IdleToStarting:
                    this.fromIdleToStarting();
                    break;

                case Transition.StartingToRunning:
                    this.fromStartingToRunning();
                    break;

                case Transition.IntermissionToRunning:
                    this.fromIntermissionToRunning();
                    break;
            }
        });
    }

    private initialize() {
        setSeed(StateHolder.state.seed);

        if (StateHolder.isRunning) {
            this.maintainTarget();
        }
    }

    private fromIdleToStarting() {
        emitNet('aslt:book', Math.random());

        setSeed(StateHolder.state.seed);
    }

    private fromStartingToRunning() {
        this.maintainTarget();
    }

    private fromIntermissionToRunning() {
        this.maintainTarget();
    }

    private fromRunningToIdle() {
        this.target.cleanUp();
    }

    private maintainTarget() {
        advanceSeed(StateHolder.state.target);
        this.target.respawn();
    }

    public update(dt: number, time: number) {
        switch (StateHolder.state.state) {
            case RoundState.Idle:
                return;

            case RoundState.Starting:
                StateHolder.timerOfStartingDecrementor = dt;

                statusText.caption = `Time to start: ${humanize(StateHolder.state.timerOfStart)}`;
                break;

            case RoundState.Intermission:
                StateHolder.timerOfIntermissionDecrementor = dt;

                statusText.caption = `Intermission: ${humanize(StateHolder.state.timerOfIntermission)}`;
                break;
            
            case RoundState.Running:
                this.target.update(dt);

                if (this.target.state === TargetLocalState.Capturing) {
                    StateHolder.timerOfTargetDecrementor = dt;
                }

                statusText.caption = `Target #${StateHolder.state.target}`;
                statusText.caption += `,  time: ${humanize(StateHolder.state.timerOfTarget)}`;
                statusText.caption += `, ` + TargetLocalState[this.target.state];
                break;
        }

        statusText.draw();
    }
}

function humanize(time: number): string {
    return (time / 1000).toFixed(1);
}
