export class Matrix {
    public M11: number = 0;
    public M12: number = 0;
    public M13: number = 0;
    public M14: number = 0;
    public M21: number = 0;
    public M22: number = 0;
    public M23: number = 0;
    public M24: number = 0;
    public M31: number = 0;
    public M32: number = 0;
    public M33: number = 0;
    public M34: number = 0;
    public M41: number = 0;
    public M42: number = 0;
    public M43: number = 0;
    public M44: number = 0;

    public static perspectiveOffCenterLH(
        left: number,
        right: number,
        bottom: number,
        top: number,
        znear: number,
        zfar: number
    ): Matrix {
        const zRange = zfar / (zfar - znear);

        const result = new Matrix();
        result.M11 = 2.0 * znear / (right - left);
        result.M22 = 2.0 * znear / (top - bottom);
        result.M31 = (left + right) / (left - right);
        result.M32 = (top + bottom) / (bottom - top);
        result.M33 = zRange;
        result.M34 = 1.0;
        result.M43 = -znear * zRange;

        return result;
    }

    public static perspectiveFovLH(fov: number, aspect: number, znear: number, zfar: number): Matrix {
        const yScale = 1.0 / Math.tan(fov * 0.5);
        const xScale = yScale / aspect;

        const halfWidth = znear / xScale;
        const halfHeight = znear / yScale;

        return Matrix.perspectiveOffCenterLH(-halfWidth, halfWidth, -halfHeight, halfHeight, znear, zfar);
    }

    public invert(): Matrix {
        const result: Matrix = new Matrix();

        const b0: number = (this.M31 * this.M42) - (this.M32 * this.M41);
        const b1: number = (this.M31 * this.M43) - (this.M33 * this.M41);
        const b2: number = (this.M34 * this.M41) - (this.M31 * this.M44);
        const b3: number = (this.M32 * this.M43) - (this.M33 * this.M42);
        const b4: number = (this.M34 * this.M42) - (this.M32 * this.M44);
        const b5: number = (this.M33 * this.M44) - (this.M34 * this.M43);

        const d11: number = this.M22 * b5 + this.M23 * b4 + this.M24 * b3;
        const d12: number = this.M21 * b5 + this.M23 * b2 + this.M24 * b1;
        const d13: number = this.M21 * -b4 + this.M22 * b2 + this.M24 * b0;
        const d14: number = this.M21 * b3 + this.M22 * -b1 + this.M23 * b0;

        let det: number = this.M11 * d11 - this.M12 * d12 + this.M13 * d13 - this.M14 * d14;
        if (Math.abs(det) === 0) {
            return result;
        }

        det = 1 / det;

        const a0: number = (this.M11 * this.M22) - (this.M12 * this.M21);
        const a1: number = (this.M11 * this.M23) - (this.M13 * this.M21);
        const a2: number = (this.M14 * this.M21) - (this.M11 * this.M24);
        const a3: number = (this.M12 * this.M23) - (this.M13 * this.M22);
        const a4: number = (this.M14 * this.M22) - (this.M12 * this.M24);
        const a5: number = (this.M13 * this.M24) - (this.M14 * this.M23);

        const d21: number = this.M12 * b5 + this.M13 * b4 + this.M14 * b3;
        const d22: number = this.M11 * b5 + this.M13 * b2 + this.M14 * b1;
        const d23: number = this.M11 * -b4 + this.M12 * b2 + this.M14 * b0;
        const d24: number = this.M11 * b3 + this.M12 * -b1 + this.M13 * b0;

        const d31: number = this.M42 * a5 + this.M43 * a4 + this.M44 * a3;
        const d32: number = this.M41 * a5 + this.M43 * a2 + this.M44 * a1;
        const d33: number = this.M41 * -a4 + this.M42 * a2 + this.M44 * a0;
        const d34: number = this.M41 * a3 + this.M42 * -a1 + this.M43 * a0;

        const d41: number = this.M32 * a5 + this.M33 * a4 + this.M34 * a3;
        const d42: number = this.M31 * a5 + this.M33 * a2 + this.M34 * a1;
        const d43: number = this.M31 * -a4 + this.M32 * a2 + this.M34 * a0;
        const d44: number = this.M31 * a3 + this.M32 * -a1 + this.M33 * a0;

        result.M11 = +d11 * det; result.M12 = -d21 * det; result.M13 = +d31 * det; result.M14 = -d41 * det;
        result.M21 = -d12 * det; result.M22 = +d22 * det; result.M23 = -d32 * det; result.M24 = +d42 * det;
        result.M31 = +d13 * det; result.M32 = -d23 * det; result.M33 = +d33 * det; result.M34 = -d43 * det;
        result.M41 = -d14 * det; result.M42 = +d24 * det; result.M43 = -d34 * det; result.M44 = +d44 * det;

        return result;
    }
}