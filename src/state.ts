import { Game } from './cfx/game'

export const RoundState = {
    Idle: 'idle',
    Starting: 'starting',
    Intermission: 'intermission',
    Running: 'running'
}

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
    playersTeams: {
        [key: number]: number
    }
    playersAtTarget: {
        [key: number]: boolean
    }
    timerOfStart: number
    timerOfTarget: number
    timerOfIntermission: number
}

export enum Transition {
    Initial = 1337,
    None = 0,
    IdleToStarting = 1,
    StartingToRunning = 2,
    RunningToIntermission = 3,
    IntermissionToRunning = 4,
    RunningToIdle = 5
}

class StateHolder {
    public state: GameState = {
        state: 'idle',
        seed: 0,
        target: 1,
        score: {},
        playersTeams: {},
        playersAtTarget: {},
        timerOfStart: 0,
        timerOfTarget: 0,
        timerOfIntermission: 0
    };

    private listeners: Function[] = [];

    public constructor() {
        // Initial sync
        Game.onMount(() => emitNet('aslt:sync'));

        // Further syncs
        onNet('aslt:sync', (state: GameState, transition: Transition) => {
            this.state = state;
            this.fireListeners(transition);
        });
        
        onNet('aslt:on-target', playerNetId => { 
            this.state[playerNetId] = true;
        });
                
        onNet('aslt:off-target', playerNetId => { 
            this.state[playerNetId] = false;
        });
    }

    public onSync(cb) {
        this.listeners.push(cb);
    }
    
    public notifyPlayerInside() {
        emitNet('aslt:on-target');
    }

    public notifyPlayerOutside() {
        emitNet('aslt:off-target');
    }

    public get localPlayerTeam(): number {
        return this.state.playersTeams[GetPlayerServerId(0)];
    }

    public get isIdle(): boolean {
        return this.state.state === RoundState.Idle;
    }

    public get isStarting(): boolean {
        return this.state.state === RoundState.Starting;
    }

    public get isRunning(): boolean {
        return this.state.state === RoundState.Running;
    }

    public get isIntermission(): boolean {
        return this.state.state === RoundState.Intermission;
    }

    private fireListeners(transition: Transition) {
        for (const listener of this.listeners) {
            listener(transition);
        }
    }
}

export default new StateHolder();
