import {
    Game,
    loadModel,
    screenFadeIn,
    screenFadeOut,
    loadCollisionAround
} from './cfx/game'

const timeToSpawn = 2000;
const model = 'a_f_y_beach_01';

let dead = false;
let diedAt = 0;

let inited = false;

setInterval(async () => {
    if (!inited) {
        inited = true;

        await respawn();
    }

    if (NetworkIsPlayerActive(PlayerId())) {
        if (dead && (Date.now() - diedAt) > timeToSpawn) {
            await respawn();
        }
    }

    if (IsEntityDead(PlayerPedId())) {
        if (!dead) {
            dead = true;
            diedAt = Date.now();
        }
    } else {
        dead = false;
        diedAt = 0;
    }
}, 50);

export function isPlayerAlive(): boolean {
    return !dead;
}

async function respawn() {
    await screenFadeOut();

    freezePlayer(true);

    await setModel();

    const ped = PlayerPedId();
    const [x, y, z] = nextSpawn();

    RequestCollisionAtCoord(x, y, z);
    SetEntityCoordsNoOffset(ped, x, y, z, false, false, false);
    NetworkResurrectLocalPlayer(x, y, z, 0, true, true);
    ClearPedTasksImmediately(ped);
    RemoveAllPedWeapons(ped, true);

    await loadCollisionAround(ped);

    ShutdownLoadingScreen();

    await screenFadeIn();

    freezePlayer(false);
}

function nextSpawn(): [number, number, number] {
    return [12.2795, 5.2670, 70.5036];
}

async function setModel() {
    console.log('loading model');
    await loadModel(model);
    console.log('model loaded', HasModelLoaded(model));

    SetPlayerModel(PlayerId(), model);
    SetModelAsNoLongerNeeded(model);
}

function freezePlayer(freeze: boolean) {
    const player = PlayerId();
    const ped = PlayerPedId();

    SetPlayerControl(player, !freeze, 0);

    if (!freeze) {
        if (!IsEntityVisible(ped)) {
            SetEntityVisible(ped, true, false);
        }

        if (!IsPedInAnyVehicle(ped, true)) {
            SetEntityCollision(ped, true, true);
        }

        FreezeEntityPosition(ped, false);
        SetPlayerInvincible(player, false);

    } else {
        if(IsEntityVisible(ped)) {
            SetEntityVisible(ped, false, false);
        }

        SetEntityCollision(ped, false, true);
        SetPlayerInvincible(player, true);

        if (!IsPedFatallyInjured(ped)) {
            ClearPedTasksImmediately(ped);
        }
    }
}
