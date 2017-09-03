import { Control } from './control'
import { Player } from './player'

export function delay(time: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, time));
}

export function screenFadeOut(): Promise<void> {
    DoScreenFadeOut(1000);

    return new Promise(resolve => {
        const interval = setInterval(() => {
            if (IsScreenFadedOut()) {
                clearInterval(interval);
                resolve();
            }
        }, 0);
    });
}

export function screenFadeIn(): Promise<void> {
    DoScreenFadeIn(1000);

    return new Promise(resolve => {
        const interval = setInterval(() => {
            if (IsScreenFadedIn()) {
                clearInterval(interval);
                resolve();
            }
        }, 0);
    });
}

export function loadModel(modelHash: number|string): Promise<void> {
    RequestModel(modelHash);

    return new Promise(resolve => {
        const interval = setInterval(() => {
            if (HasModelLoaded(modelHash)) {
                clearInterval(interval);
                resolve();
            }
        }, 0);
    });
}

export function loadScaleform(scaleform: string): Promise<number> {
    let scaleformHandle = RequestScaleformMovie(scaleform);

    return new Promise(resolve => {
        const interval = setInterval(() => {
            if (HasScaleformMovieLoaded(scaleformHandle)) {
                clearInterval(interval);
                resolve(scaleformHandle);
            } else {
                scaleformHandle = RequestScaleformMovie(scaleform);
            }
        }, 0);
    });
}

export function loadCollisionAround(entity: number): Promise<void> {
    return new Promise(resolve => {
        const interval = setInterval(() => {
            if (HasCollisionLoadedAroundEntity(entity)) {
                clearInterval(interval);
                resolve();
            }
        }, 0);
    });
}

export const Game = {
    get maxPlayers(): number {
        return 32;
    },

    get localPlayer(): Player {
        return new Player(-1);
    },

    *getPlayers(): IterableIterator<Player> {
        const players: Player[] = [];

        for (let i = 0; i < this.maxPlayers; i++) {
            if (NetworkIsPlayerActive(i)) {
                yield new Player(i);
            }
        }
    },

    controls: {
        get withShift(): boolean {
            return !!IsControlPressed(0, Control.Sprint);
        },

        isJustReleased(control: Control) {
            return IsControlJustReleased(0, control);
        },

        isJustPressed(control: Control) {
            return IsControlJustPressed(0, control);
        }
    },

    screen: {
        get width(): number {
            return GetScreenResolution()[0];
        },

        get height(): number {
            return GetScreenResolution()[1];
        }
    },

    onMount(cb) {
        on('onClientResourceStart', (resName) => {
            if (resName === GetCurrentResourceName()) {
                cb();
            }
        });
    },

    onUnmount(cb) {
        on('onClientResourceStop', (resName) => {
            if (resName === GetCurrentResourceName()) {
                cb();
            }
        });
    }
};
