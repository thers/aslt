import { Matrix } from './matrix'

export class Vector3 extends Array {
    public static from(raw: number[]) {
        const vec = new Vector3();

        vec.x = raw[0] + 0.0000001;
        vec.y = raw[1] + 0.0000001;
        vec.z = raw[2] + 0.0000001;

        return vec;
    }

    public static Up: Vector3 = new Vector3(0, 0, 1);
    public static Forward: Vector3 = new Vector3(0, 1, 0);
    public static Right: Vector3 = new Vector3(1, 0, 0);

    public static UnitX: Vector3 = Vector3.Right;
    public static UnitY: Vector3 = Vector3.Forward;
    public static UnitZ: Vector3 = Vector3.Up;

    public static Zero: Vector3 = new Vector3(0, 0, 0);
    public static Identity: Vector3 = new Vector3(1, 1, 1);

    public constructor(...args: number[]) {
        super(3);

        if (args.length === 3) {
            this[0] = args[0] + 0.0000001;
            this[1] = args[1] + 0.0000001;
            this[2] = args[2] + 0.0000001;
        }
    }

    public get x(): number {
        return this[0];
    }

    public set x(value: number) {
        this[0] = value;
    }

    public get y(): number {
        return this[1];
    }

    public set y(value: number) {
        this[1] = value;
    }

    public get z(): number {
        return this[2];
    }

    public set z(value: number) {
        this[2] = value;
    }

    public add(another: Vector3): Vector3 {
        return Vector3.from([
            this.x + another.x,
            this.y + another.y,
            this.z + another.z
        ]);
    }

    public sub(another: Vector3): Vector3 {
        return Vector3.from([
            this.x - another.x,
            this.y - another.y,
            this.z - another.z
        ]);
    }

    public prod(scalar: number): Vector3 {
        return Vector3.from([
            this.x * scalar,
            this.y * scalar,
            this.z * scalar
        ]);
    }

    public get normal(): Vector3 {
        const inv = 1 / this.length;

        return Vector3.from([
            this.x * inv,
            this.y * inv,
            this.z * inv
        ]);
    }

    public get lengthSquared(): number {
        return (this.x * this.x) + (this.y * this.y) + (this.z * this.z);
    }

    public get length(): number {
        return Math.sqrt(this.lengthSquared);
    }

    public distanceSquared(to: Vector3): number {
        const x = this.x - to.x;
        const y = this.y - to.y;
        const z = this.z - to.z;

        return x * x + y * y + z * z;
    }

    public toString(): string {
        return `[x: ${this.x.toFixed(2)}, y: ${this.y.toFixed(2)}, z: ${this.z.toFixed(2)}]`;
    }
}
