import { Game } from './cfx/game'
import { Control } from './cfx/control'
import { Camera } from './cfx/camera'
import { Vector3 } from './cfx/vector'
import { Round } from './round'
import { Text, Font } from './cfx/text'

let round = new Round();

Game.onMount(() => {
    console.log('Inited!');
});

Game.onUnmount(() => {
    round.stopAndDelete();
});

let lastTime = 0;

setTick(async () => {
    const time = new Date().getTime();
    const dt = time - lastTime;

    if (Game.controls.isJustPressed(Control.PhoneUp)) {
        round.start();
    }

    round.update(dt, time);

    lastTime = time;
});

RegisterCommand('pos', () => console.info(Game.localPlayer.position), false);
