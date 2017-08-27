import { Game } from './cfx/game'
import { Control } from './cfx/control'
import { Camera } from './cfx/camera'
import { Vector3 } from './cfx/vector'
import { Round } from './round'
import { Text, Font } from './cfx/text'
import { projectToGame } from './position'
import { setSeed } from './proceduralRandom'

enum DecorationType {
    Float = 1,
    Bool = 2,
    Int = 3,
    Time = 5
}

let round = new Round();

Game.onMount(() => {
    // Setup decorators
    DecorRegister('aslt_random', <number>DecorationType.Float);
    DecorRegister('aslt_team', <number>DecorationType.Int);

    // Register event listeners
    onNet('aslt:round:start', seed => {
        setSeed(seed);
        round.start();
    });
});
Game.onUnmount(() => round.stop());

let lastTime = 0;

setTick(async () => {
    const time = new Date().getTime();
    const dt = time - lastTime;

    if (Game.controls.isJustPressed(Control.PhoneRight)) {
        emitNet('aslt:round:start', Math.random() * 0xffffffff |0);
    }

    // if (Game.controls.isJustPressed(Control.PhoneDown)) {
    //     for (const player of Game.getPlayers()) {
    //         console.debug(
    //             'PLAYER',
    //             player.name,
    //             player.getIntDecor('aslt_team'),
    //             player.getFloatDecor('aslt_random')
    //         );
    //     }
    // }

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
