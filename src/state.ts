import { Game } from './cfx/game'

export const RoundState = {
    Idle: 'idle',
    Starting: 'starting',
    Intermission: 'intermission',
    Running: 'running'
}

export interface GameState {
    state: 'idle' | 'starting' | 'running' | 'intermission'
    seed: number
    target: number
    score: number[]
    playersTeams: {
        [key: number]: number
    }
    playersAtTarget: {
        [key: number]: boolean
    }
    timerOfStart: number
    timerOfTarget: number
    timerOfIntermission: number

    timeForStart: number
    timeForTarget: number
    timeForIntermission: number
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
        score: [],
        playersTeams: {},
        playersAtTarget: {},
        timeForStart: 0,
        timerOfStart: 0,
        timeForTarget: 0,
        timerOfTarget: 0,
        timeForIntermission: 0,
        timerOfIntermission: 0,
    };

    private listeners: Function[] = [];

    public constructor() {
        // Initial sync
        Game.onMount(() => emitNet('aslt:sync'));

        // Further syncs
        onNet('aslt:sync', (state: GameState, transition: Transition) => {
            const newState = {
                ...state
            };

            if (Array.isArray(state.playersAtTarget)) {
                newState.playersAtTarget = {};

                state.playersAtTarget.forEach((isOnTarget, playerServerId) => {
                    newState.playersAtTarget[playerServerId] = isOnTarget;
                });
            }

            if (Array.isArray(state.playersTeams)) {
                newState.playersTeams = {};

                state.playersTeams.forEach((teamId, playerServerId) => {
                    newState.playersTeams[playerServerId] = teamId;
                });
            }

            this.state = newState;
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

    public getPlayerTeam(playerServerId: string): number {
        return this.state.playersTeams[playerServerId];
    }

    public get localPlayerTeam(): number {
        return this.state.playersTeams[GetPlayerServerId(PlayerId())] || 0;
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

    public set timerOfStartingDecrementor(dt: number) {
        this.state.timerOfStart -= dt;

        if (this.state.timerOfStart < 0) {
            this.state.timerOfStart = 0;
        }
    }

    public set timerOfTargetDecrementor(dt: number) {
        this.state.timerOfTarget -= dt;

        if (this.state.timerOfTarget < 0) {
            this.state.timerOfTarget = 0;
        }
    }

    public set timerOfIntermissionDecrementor(dt: number) {
        this.state.timerOfIntermission -= dt;

        if (this.state.timerOfIntermission < 0) {
            this.state.timerOfIntermission = 0;
        }
    }

    private fireListeners(transition: Transition) {
        for (const listener of this.listeners) {
            listener(transition);
        }
    }
}

export default new StateHolder();
