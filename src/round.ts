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
import * as ui from './ui'

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

                case Transition.RunningToIntermission:
                    this.fromRunningToIntermission();
                    break;

                case Transition.RunningToIdle:
                    this.fromRunningToIdle();
                    break;
            }
        });
    }

    private initialize() {
        setSeed(StateHolder.state.seed);

        if (StateHolder.isStarting) {
            this.fromIdleToStarting();
        }

        if (StateHolder.isIntermission) {
            this.fromRunningToIntermission();
        }

        if (StateHolder.isRunning) {
            if (StateHolder.state.target === 1) {
                this.fromStartingToRunning();
            } else {
                this.fromIntermissionToRunning();
            }
        }

        console.log('INITED');
    }

    /**
     * IDLE -> STARTING
     */
    private fromIdleToStarting() {
        ui.hudReset();
        ui.hudSetState('WARM UP');

        emitNet('aslt:book', Math.random());

        setSeed(StateHolder.state.seed);
    }

    /**
     * STARTING -> RUNNING
     */
    private fromStartingToRunning() {
        this.maintainTarget();

        ui.hudSetTargetsCount('1/2');
        ui.hudSetTeam(StateHolder.localPlayerTeam);
        this.updateScores();
    }

    /**
     * INTERMISSION -> RUNNING
     */
    private fromIntermissionToRunning() {
        this.maintainTarget();

        ui.hudSetTargetsCount('2/2');
        ui.hudSetTeam(StateHolder.localPlayerTeam);
        this.updateScores();
    }

    /**
     * RUNNING -> INTERMISSION
     */
    private fromRunningToIntermission() {
        this.target.cleanUp();
        this.updateScores();

        ui.hudSetTargetProgress(1, TargetLocalState.Captured, 0);
        ui.hudSetState('NEXT TARGET');
    }

    /**
     * RUNNING -> IDLE
     */
    private fromRunningToIdle() {
        this.target.cleanUp();
        this.updateScores();
        ui.hudSetState('GAME OVER');
        ui.hudSetTargetProgress(1, TargetLocalState.Captured, 0);
    }

    private updateScores() {
        ui.hudSetScore(
            (StateHolder.state.score[0] || 0)|0,
            (StateHolder.state.score[1] || 0)|0
        );
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
                ui.hudSetCounter(StateHolder.state.timerOfStart);
                break;

            case RoundState.Intermission:
                StateHolder.timerOfIntermissionDecrementor = dt;
                ui.hudSetCounter(StateHolder.state.timerOfIntermission);
                break;
            
            case RoundState.Running:
                this.target.update(dt);

                if (this.target.state === TargetLocalState.Capturing) {
                    StateHolder.timerOfTargetDecrementor = dt;
                }

                ui.hudSetTargetProgress(
                    (StateHolder.state.timeForTarget - StateHolder.state.timerOfTarget) / StateHolder.state.timeForTarget,
                    this.target.state,
                    this.target.leadTeam
                );
                break;
        }
    }
}

function humanize(time: number): string {
    return (time / 1000).toFixed(1);
}
