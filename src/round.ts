import { Text, Font, Alignment } from './cfx/text'
import { Color, Known } from './cfx/color'
import { Vector3 } from './cfx/vector'
import { Player } from './cfx/player'
import { Game } from './cfx/game'
import { Target } from './target'
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
            console.debug('State sync', Transition[transition], StateHolder.state);

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
        console.info('Round initialized');

        if (StateHolder.isRunning) {
            this.maintainTarget();
        }
    }

    private fromIdleToStarting() {
        console.info('Round is about to start');

        emitNet('aslt:book', Math.random());

        setSeed(StateHolder.state.seed);
    }

    private fromStartingToRunning() {
        console.info('Round started');

        this.maintainTarget();
    }

    private fromIntermissionToRunning() {
        console.info('Round next target spawned');

        this.maintainTarget();
    }

    private fromRunningToIdle() {
        console.info('Round has ended');

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
                StateHolder.state.timerOfStart -= dt;

                if (StateHolder.state.timerOfStart < 0) {
                    StateHolder.state.timerOfStart = 0;
                }

                statusText.caption = `Time to start: ${humanize(StateHolder.state.timerOfStart)}`;
                break;

            case RoundState.Intermission:
                StateHolder.state.timerOfIntermission -= dt;

                if (StateHolder.state.timerOfIntermission < 0) {
                    StateHolder.state.timerOfIntermission = 0;
                }

                statusText.caption = `Intermission: ${humanize(StateHolder.state.timerOfIntermission)}`;
                break;
            
            case RoundState.Running:
                this.target.update(dt);
                statusText.caption = `Capture target: ${StateHolder.state.target}, time: ${humanize(StateHolder.state.timerOfTarget)}`;
                break;
        }

        statusText.draw();
    }
}

function humanize(time: number): string {
    return (time / 1000).toFixed(1);
}
