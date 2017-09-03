import { Game } from './cfx/game'
import { Control } from './cfx/control'
import { Vector3 } from './cfx/vector'
import { Text, Font, Alignment } from './cfx/text'
import { Player } from './cfx/player'
import { projectToGame } from './position'
import { setSeed } from './proceduralRandom'
import { Round } from './round'
import * as ui from './ui'
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

function HeightPosInWater(x: number, y: number): [boolean, number] {
    return Citizen.invokeNative<[boolean, number]>(
        '0xF6829842C06AE524',//"0x8EE6B53CE13A9794",
        x + 0.00000001,
        y + 0.00000001,
        0.00000001,
        Citizen.pointerValueFloat(),
        Citizen.returnResultAnyway(),
        Citizen.resultAsInteger()
    );
}

const ind = new Text('', [0.05, 0.05]);
ind.alignment = Alignment.Left;

setTick(async () => {
    const time = new Date().getTime();
    const dt = time - lastTime;

    if (Game.controls.isJustPressed(Control.PhoneRight)) {
        emitNet('aslt:start', Math.random() * 0xffffffff |0);
    }

    if (Game.controls.isJustPressed(Control.PhoneDown)) {
        emitNet('plr');
    }

    // try {
        round.update(dt, time);
    // } catch(e) {
    //     console.error(e);
    // }

    ui.drawHud();

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
