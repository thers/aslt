import * as hashInt from 'hash-int'

let seed = 0;

export function setSeed(val: number) {
    seed = val;
}

export function nextInt(): number {
    return hashInt(seed++);
}

export function nextFloat(): number {
    return nextInt() / 0xffffffff;
}
