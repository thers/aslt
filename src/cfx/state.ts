import { Events } from './core'

interface Listener<T> {
    (value: T): void
}

class StateEntry<T> {
    private listeners: Listener<T>[] = [];

    public constructor(private name: string, private _value: T) {
        onNet(Events.StateSync + name, (value: T) => {
            this._value = value;
            this.fireListeners();
        });
    }

    public listen(cb: Listener<T>) {
        this.listeners.push(cb);
    }

    public set(value: T) {
        this._value = value;

        emitNet(Events.StateSync, this.name, value);
    }

    public get(): T {
        return this._value;
    }

    private fireListeners() {
        const value = this._value;

        for (const listener of this.listeners) {
            listener(value);
        }
    }
}

export default class State {
    static targetsAlive: StateEntry<number> = new StateEntry('targets-alive', 0);
}
