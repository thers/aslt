import { Control } from './control'
import { Player } from './player'

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
