import { Target } from './target'
import { Text, Font, Alignment } from './cfx/text'
import { Color, Known } from './cfx/color'
import { Vector3 } from './cfx/vector'
import { Game } from './cfx/game'

export enum RoundState {
    Waiting,
    Running
}

const statusText = new Text('wtf', [0.5, 0.05], .5, Known.White, Font.ChaletLondon);
statusText.outline = true;
statusText.alignment = Alignment.Center;

export class Round {
    public targets: Set<Target> = new Set();
    public teams: Set<Team> = new Set();
    public state: RoundState = RoundState.Waiting;

    public start() {
        this.targets = new Set();

        const target1 = new Target();
        const target2 = new Target();

        const playerPos = Game.localPlayer.position;

        target1.spawn(playerPos.add(new Vector3(15, 0, 0)));
        target2.spawn(playerPos.add(new Vector3(-15, 0, 0)));

        this.targets.add(target1);
        this.targets.add(target2);

        this.state = RoundState.Running;
    }

    public stopAndDelete() {
        for (const target of this.targets) {
            target.delete();
        }

        this.state = RoundState.Waiting;
    }

    public update(dt: number, time: number) {
        if (this.state === RoundState.Running) {
            const status = [];

            for (const target of this.targets) {
                target.update(dt, time);

                status.push(target.toString());
            }

            statusText.caption = status.join(', ');
        } else {
            statusText.caption = 'Round is about to get started...';
        }

        this.updateUi();
    }

    public updateUi() {
        statusText.draw();
    }
}

export class Team {

}
