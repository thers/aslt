import { Game } from './cfx/game'
import { Control } from './cfx/control'
import { Vector3 } from './cfx/vector'
import { Text, Font } from './cfx/text'
import { Player } from './cfx/player'
import { projectToGame } from './position'
import { setSeed } from './proceduralRandom'
import { Round } from './round'
import './state'

enum DecorationType {
    Float = 1,
    Bool = 2,
    Int = 3,
    Time = 5
}

let round = new Round();

Game.onMount(() => {});

let lastTime = 0;

setTick(async () => {
    const time = new Date().getTime();
    const dt = time - lastTime;

    if (Game.controls.isJustPressed(Control.PhoneRight)) {
        emitNet('aslt:start', Math.random() * 0xffffffff |0);
    }

    if (Game.controls.isJustPressed(Control.PhoneDown)) {
        emitNet('plr');
    }

    round.update(dt, time);

    lastTime = time;
});

RegisterCommand('pos', () => {
    const pos = Game.localPlayer.position;
    const zoneId = GetZoneAtCoords(pos.x, pos.y, pos.z);
    const zoneName = GetNameOfZone(pos.x, pos.y, pos.z);

    console.info(`Pos:`, pos);
    console.info(`Zone id:`, zoneId);
    console.info(`Zone name:`, zoneName);
}, false);
