class SystemMatrix {

    public static Columns(cm: ComponentMatrix): ComponentMatrix {
        let out = Array<number[]>(cm.rows.length);
        for (let index = 0; index < cm.rows.length; index++) {
            out[index] = Array<number>(cm.rows[index].length);
            for (let i = 0; i < cm.rows[index].length; i++) {
                out[index][i] = cm.rows[i][index];
            }
        }
        // or return new ComponentMatrix(cm.rows[0].map((_, i) => cm.rows.map(r => r[i])));
        return new ComponentMatrix(out);
    }

    public static Transpose(cm: ComponentMatrix): ComponentMatrix {
        return this.Columns(cm);
    }

    public static Determinant(cm: ComponentMatrix): number {
        if (cm.rows[0].length !== cm.rows.length) {
            const msg = 'Matrices must match in length both rows and columns.';
            console.log(msg);
            throw new Error(msg);
        }
        if (cm.rows.length === 2) return cm.rows[0][0] * cm.rows[1][1] - cm.rows[0][1] * cm.rows[1][0];
        return (cm.rows[0].map((coefficient, index) => {
            const result = coefficient * this.Determinant(new ComponentMatrix(cm.rows.slice(1).map(row => [...row.slice(0, index), ...row.slice(index + 1)])))
            return index % 2 === 0 ? result : -result;
        })).reduce((accumulator, value) => accumulator + value, 0);
    }

    public static Adjugate(cm: ComponentMatrix): ComponentMatrix {
        return this.Transpose(new ComponentMatrix(cm.rows.map((row, index) => row.map((_, i) => this.Cofactor(cm, index, i)))));
    }

    public static Inverse(cm: ComponentMatrix): ComponentMatrix {
        const determinant = this.Determinant(cm);
        if (determinant === 0) {
            const msg = "Determinant can't be zero."
            console.log(msg);
            throw new Error(msg);
        }
        return this.ScaleBy(this.Adjugate(cm), 1 / determinant);
    }

    public static Add(cm: ComponentMatrix, other: ComponentMatrix): ComponentMatrix {
        return new ComponentMatrix(other.rows.map((row, index) => row.map((element, i) => cm.rows[index][i] + element)));
    }

    public static Subtract(cm: ComponentMatrix, other: ComponentMatrix): ComponentMatrix {
        return new ComponentMatrix(other.rows.map((row, index) => row.map((element, i) => cm.rows[index][i] - element)));
    }

    public static ScaleBy(cm: ComponentMatrix, number: number): ComponentMatrix {
        return new ComponentMatrix(cm.rows.map(row => row.map(element => element * number)))
    }

    public static Multiply(cm: ComponentMatrix, other: ComponentMatrix): ComponentMatrix {
        if (cm.rows[0].length !== other.rows[0].length) {
            const msg = 'Number of columns and rows must match.';
            console.log(msg);
            throw new Error(msg);
        }
        return new ComponentMatrix(cm.rows.map(row => this.Columns(other).rows.map(column => (row.map((element, i) => element * column[i])).reduce((accumulator, value) => accumulator + value, 0))));
    }

    public static Minor(cm: ComponentMatrix, i: number, j: number): number {
        // withoutElementAtIndex = (arr, index) => [ ...arr.slice(0, index), ...arr.slice(index + 1) ]
        return this.Determinant(new ComponentMatrix([...cm.rows.slice(0, i), ...cm.rows.slice(i + 1)].map(row => [...row.slice(0, j), ...row.slice(j + 1)])));
    }

    public static Cofactor(cm: ComponentMatrix, i: number, j: number): number {
        return this.Minor(cm, i, j) * Math.pow(-1, i + j);
    }
}

class SystemVector {
    // data unique to system
    private static readonly epsilon = 0.00000001;

    public static Length(cv: ComponentVector): number {
        return Math.hypot(...cv.dimensions);
    }

    public static Normalize(cv: ComponentVector): ComponentVector {
        return this.ScaleBy(cv, 1 / this.Length(cv));
    }

    public static Negate(cv: ComponentVector): ComponentVector {
        return this.ScaleBy(cv, -1);
    }

    public static Add(cv: ComponentVector, other: ComponentVector): ComponentVector {
        return new ComponentVector(other.dimensions.map((dimension, index) => (cv.dimensions[index] + dimension)));
    }

    public static Subtract(cv: ComponentVector, other: ComponentVector): ComponentVector {
        return new ComponentVector(other.dimensions.map((dimension, index) => (cv.dimensions[index] - dimension)));
    }

    public static ScaleBy(cv: ComponentVector, number: number): ComponentVector {
        return new ComponentVector(cv.dimensions.map(dimension => dimension * number));
    }

    public static DotProduct(cv: ComponentVector, other: ComponentVector): number {
        return other.dimensions.reduce((accumulator, dimension, index) => accumulator + dimension * cv.dimensions[index], 0);
    }

    private static AlignmentWith(cv: ComponentVector, other: ComponentVector, alignment: number): number {
        return Math.abs(this.DotProduct(this.Normalize(cv), this.Normalize(other)) - alignment)
    }

    public static HaveSameDirectionWith(cv: ComponentVector, other: ComponentVector): boolean {
        return this.AlignmentWith(cv, other, 1) < this.epsilon;
    }

    public static HaveOppositeDirectionTo(cv: ComponentVector, other: ComponentVector): boolean {
        return this.AlignmentWith(cv, other, -1) < this.epsilon;
    }

    public static IsPerpendicularTo(cv: ComponentVector, other: ComponentVector): boolean {
        return this.AlignmentWith(cv, other, 0) < this.epsilon;
    }

    public static D3CrossProduct(cv: ComponentVector, other: ComponentVector): ComponentVector {
        return new ComponentVector([
            cv.dimensions[1] * other.dimensions[2] - cv.dimensions[2] * other.dimensions[1],
            cv.dimensions[2] * other.dimensions[0] - cv.dimensions[0] * other.dimensions[2],
            cv.dimensions[0] * other.dimensions[1] - cv.dimensions[1] * other.dimensions[0]
        ]);// 3D only for now; maybe add dimensions: number arg
    }

    private static ToDegrees(radians: number): number {
        return (radians * 180) / Math.PI;
    }

    public static AngleBetween(cv: ComponentVector, other: ComponentVector): number {
        return this.ToDegrees(Math.acos(this.DotProduct(cv, other) / (this.Length(cv) * this.Length(other))));
    }

    public static ProjectOn(cv: ComponentVector, other: ComponentVector): ComponentVector {
        const normalized = this.Normalize(other);
        return this.ScaleBy(normalized, this.DotProduct(cv, normalized));
    }

    public static WithLength(cv: ComponentVector, length: number): ComponentVector {
        return this.ScaleBy(this.Normalize(cv), length);
    }

    public static EqualTo(cv: ComponentVector, other: ComponentVector): boolean {
        return other.dimensions.every((dimension, index) => (Math.abs(dimension - cv.dimensions[index]) < this.epsilon));
    }

    public static Transform(cv: ComponentVector, matrix: ComponentMatrix): ComponentVector {
        const columns = SystemMatrix.Columns(matrix);
        if (columns.rows.length !== cv.dimensions.length) {
            const msg = 'Matrix columns and vector dimensions are not equal!';
            console.log(msg);
            throw new Error(msg);
        }
        const multiplied = columns.rows.map((column, index) => column.map(c => c * cv.dimensions[index]));
        return new ComponentVector(multiplied[0].map((_, i) => (multiplied.map(column => column[i]).reduce((accumulator, value) => accumulator + value))));
    }
}
