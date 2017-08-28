import { Game } from './cfx/game'

export interface TeamsScore {
    [key: number]: number
}

export interface Score {
    [key: number]: TeamsScore
}

export interface GameState {
    state: 'idle' | 'starting' | 'running' | 'intermission'
    seed: number
    target: number
    score: Score
    playersAtTarget: {
        [key: number]: boolean
    }
    timerOfStart: number
    timerOfTarget: number
    timerOfIntermission: number
}

export enum Transition {
    None,
    IdleToStarting,
    StartingToRunning,
    RunningToIntermission,
    IntermissionToRunning,
    RunningToIdle
}

class StateHolder {
    public state: GameState = {
        state: 'idle',
        seed: 0,
        target: 1,
        score: {},
        playersAtTarget: {},
        timerOfStart: 0,
        timerOfTarget: 0,
        timerOfIntermission: 0
    };

    private listeners: Function[];

    public constructor() {
        // Initial sync
        Game.onMount(() => emitNet('aslt:sync'));

        // Further syncs
        onNet('aslt:sync', (state: GameState, transition: Transition) => {
            this.state = state;
            this.fireListeners(transition);
        });
    }

    public onSync(cb) {
        this.listeners.push(cb);
    }

    private fireListeners(transition: Transition) {
        for (const listener of this.listeners) {
            listener(transition);
        }
    }
}

export default new StateHolder();
