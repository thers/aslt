import { Game } from './cfx/game'
import { Control } from './cfx/control'
import { Camera } from './cfx/camera'
import { Vector3 } from './cfx/vector'
import { Target } from './target'
import { Text, Font } from './cfx/text'


const targets: Set<Target> = new Set();

Game.onMount(() => {
    console.log('Inited!');
});

Game.onUnmount(() => {
    for (const target of targets) {
        target.delete();
    }
});

let lastTime = 0;

const gearDisplay = new Text('', [0.1, 0.1]);
gearDisplay.font = Font.ChaletComprimeCologne;

setTick(async () => {
    const time = new Date().getTime();
    const dt = (time - lastTime) / 1000;

    if (Game.controls.isJustPressed(Control.PhoneUp)) {
        console.log('Urgh... ' + Game.localPlayer.name);

        let newTarget: Target;

        try {
            newTarget = new Target();
        } catch(e) {
            console.error(e); 
        }

        newTarget.spawn(
            Game.localPlayer.position.add(new Vector3(10, 0, 0))
        );

        targets.add(newTarget);
    }

    if (targets.size > 0) {
        const time = new Date().getTime();

        for (const target of targets) {
            target.update(dt, time);
        }
    }

    const ped = GetPlayerPed(-1);

    if (IsPedInAnyVehicle(ped, false)) {
        const veh = GetVehiclePedIsIn(ped, false);

        const gear = GetVehicleCurrentGear(veh);

        gearDisplay.caption = 'g' + gear;

        gearDisplay.draw();
    }

    lastTime = time;
});
