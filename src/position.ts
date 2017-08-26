import { Vector3 } from './cfx/vector'

const topLeftGame = [-3747.14, 8002.75];
const bottomRightGame = [4510.38, -4404.49];

const topLeft = [0, 0];
const bottomRight = [1, 1];

const scaleX = Math.abs(topLeftGame[0] - bottomRightGame[0]);
const scaleY = Math.abs(topLeftGame[1] - bottomRightGame[1]);

const offsetX = topLeftGame[0];
const offsetY = bottomRightGame[1];

export function projectToGame(x: number, y: number, z: number): Vector3 {
    return new Vector3(
        x * scaleX + offsetX,
        (1 - y) * scaleY + offsetY,
        z
    );
}
