import { Marker, MarkerType } from './cfx/marker'
import { Color, Known } from './cfx/color'
import { Vector3 } from './cfx/vector'
import { Scaleform } from './cfx/scaleform'
import { Sprite } from './cfx/sprite'
import { TargetLocalState } from './target'

const bgColor = Color.alterAlpha(Known.White, 255);

const bg = new Sprite(
    [0, -.3],
    ['shared', 'bggradient_32x1024'],
    [2, 1],
    0,
    bgColor
);

const hud = new Scaleform('aslt');

function humanizeTime(time: number): string {
    return (time / 1000).toFixed(1);
}

export function drawHud() {
    if (!hud.isReady) {
        return;
    }

    bg.draw();
    hud.render2d();
}

export function hudReset() {
    hud.invoke('RESET');
}

export function hudSetState(state) {
    hud.invoke('SET_STATE', state);
}

export function hudSetTeam(team: number) {
    console.log('TEAM', team);

    hud.invoke('SET_TEAM', team);
}

export function hudSetCounter(time: number) {
    hud.invoke('SET_COUNTER', humanizeTime(time));
}

export function hudSetScore(firstTeam: number, secondTeam: number) {
    hud.invoke('SET_SCORE', firstTeam, secondTeam);
}

export function hudSetTargetsCount(count: string) {
    hud.invoke('SET_TARGETS_COUNT', count);
}

export function hudSetTargetProgress(
    progress: number,
    state: TargetLocalState,
    team: number
) {
    hud.invoke('SET_TARGET_PROGRESS', progress, <number>state, team);
}
