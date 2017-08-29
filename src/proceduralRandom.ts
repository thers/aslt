import * as hashInt from 'hash-int'

let originalSeed = 0;
let seed = 0;

export function setSeed(val: number) {
    seed = val;
    originalSeed = val;
}

export function advanceSeed(amount: number) {
    seed = hashInt(originalSeed) + amount |0;
}

export function nextInt(): number {
    return hashInt(seed++);
}

export function nextFloat(): number {
    return nextInt() / 0xffffffff;
}
