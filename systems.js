"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemVector = exports.SystemMatrix = void 0;
const components_1 = require("./components");
class SystemMatrix {
    static Columns(cm) {
        let out = Array(cm.rows.length);
        for (let index = 0; index < cm.rows.length; index++) {
            out[index] = Array(cm.rows[index].length);
            for (let i = 0; i < cm.rows[index].length; i++) {
                out[index][i] = cm.rows[i][index];
            }
        }
        // or return new ComponentMatrix(cm.rows[0].map((_, i) => cm.rows.map(r => r[i])));
        return new components_1.ComponentMatrix(out);
    }
    static Transpose(cm) {
        return this.Columns(cm);
    }
    static Determinant(cm) {
        if (cm.rows[0].length !== cm.rows.length) {
            const msg = 'Matrices must match in length both rows and columns.';
            console.log(msg);
            throw new Error(msg);
        }
        if (cm.rows.length === 2)
            return cm.rows[0][0] * cm.rows[1][1] - cm.rows[0][1] * cm.rows[1][0];
        return (cm.rows[0].map((coefficient, index) => {
            const result = coefficient * this.Determinant(new components_1.ComponentMatrix(cm.rows.slice(1).map(row => [...row.slice(0, index), ...row.slice(index + 1)])));
            return index % 2 === 0 ? result : -result;
        })).reduce((accumulator, value) => accumulator + value, 0);
    }
    static Adjugate(cm) {
        return this.Transpose(new components_1.ComponentMatrix(cm.rows.map((row, index) => row.map((_, i) => this.Cofactor(cm, index, i)))));
    }
    static Inverse(cm) {
        const determinant = this.Determinant(cm);
        if (determinant === 0) {
            const msg = "Determinant can't be zero.";
            console.log(msg);
            throw new Error(msg);
        }
        return this.ScaleBy(this.Adjugate(cm), 1 / determinant);
    }
    static Add(cm, other) {
        return new components_1.ComponentMatrix(other.rows.map((row, index) => row.map((element, i) => cm.rows[index][i] + element)));
    }
    static Subtract(cm, other) {
        return new components_1.ComponentMatrix(other.rows.map((row, index) => row.map((element, i) => cm.rows[index][i] - element)));
    }
    static ScaleBy(cm, number) {
        return new components_1.ComponentMatrix(cm.rows.map(row => row.map(element => element * number)));
    }
    static Multiply(cm, other) {
        if (cm.rows[0].length !== other.rows[0].length) {
            const msg = 'Number of columns and rows must match.';
            console.log(msg);
            throw new Error(msg);
        }
        let out = Array(cm.rows.length);
        for (let row = 0; row < cm.rows[0].length; row++) {
            out[row] = Array(cm.rows[row].length);
            for (let column = 0; column < cm.rows[0].length; column++) {
                out[row][column] = 0;
                for (let multi = 0; multi < cm.rows[0].length; multi++) {
                    out[row][column] += (cm.rows[row][multi] * other.rows[multi][column]);
                }
            }
        }
        return new components_1.ComponentMatrix(out);
    }
    static Minor(cm, i, j) {
        // withoutElementAtIndex = (arr, index) => [ ...arr.slice(0, index), ...arr.slice(index + 1) ]
        return this.Determinant(new components_1.ComponentMatrix([...cm.rows.slice(0, i), ...cm.rows.slice(i + 1)].map(row => [...row.slice(0, j), ...row.slice(j + 1)])));
    }
    static Cofactor(cm, i, j) {
        return this.Minor(cm, i, j) * Math.pow(-1, i + j);
    }
}
exports.SystemMatrix = SystemMatrix;
class SystemVector {
    static Length(cv) {
        return Math.hypot(...cv.dimensions);
    }
    static Normalize(cv) {
        return this.ScaleBy(cv, 1 / this.Length(cv));
    }
    static Negate(cv) {
        return this.ScaleBy(cv, -1);
    }
    static Add(cv, other) {
        return new components_1.ComponentVector(other.dimensions.map((dimension, index) => (cv.dimensions[index] + dimension)));
    }
    static Subtract(cv, other) {
        return new components_1.ComponentVector(other.dimensions.map((dimension, index) => (cv.dimensions[index] - dimension)));
    }
    static ScaleBy(cv, number) {
        return new components_1.ComponentVector(cv.dimensions.map(dimension => dimension * number));
    }
    static DotProduct(cv, other) {
        return other.dimensions.reduce((accumulator, dimension, index) => accumulator + dimension * cv.dimensions[index], 0);
    }
    static AlignmentWith(cv, other, alignment) {
        return Math.abs(this.DotProduct(this.Normalize(cv), this.Normalize(other)) - alignment);
    }
    static HaveSameDirectionWith(cv, other) {
        return this.AlignmentWith(cv, other, 1) < this.epsilon;
    }
    static HaveOppositeDirectionTo(cv, other) {
        return this.AlignmentWith(cv, other, -1) < this.epsilon;
    }
    static IsPerpendicularTo(cv, other) {
        return this.AlignmentWith(cv, other, 0) < this.epsilon;
    }
    static D3CrossProduct(cv, other) {
        return new components_1.ComponentVector([
            cv.dimensions[1] * other.dimensions[2] - cv.dimensions[2] * other.dimensions[1],
            cv.dimensions[2] * other.dimensions[0] - cv.dimensions[0] * other.dimensions[2],
            cv.dimensions[0] * other.dimensions[1] - cv.dimensions[1] * other.dimensions[0]
        ]); // 3D only for now; maybe add dimensions: number arg
    }
    static ToDegrees(radians) {
        return (radians * 180) / Math.PI;
    }
    static AngleBetween(cv, other) {
        return this.ToDegrees(Math.acos(this.DotProduct(cv, other) / (this.Length(cv) * this.Length(other))));
    }
    static ProjectOn(cv, other) {
        const normalized = this.Normalize(other);
        return this.ScaleBy(normalized, this.DotProduct(cv, normalized));
    }
    static WithLength(cv, length) {
        return this.ScaleBy(this.Normalize(cv), length);
    }
    static EqualTo(cv, other) {
        return other.dimensions.every((dimension, index) => (Math.abs(dimension - cv.dimensions[index]) < this.epsilon));
    }
    static Transform(cv, matrix) {
        const columns = SystemMatrix.Columns(matrix);
        if (columns.rows.length !== cv.dimensions.length) {
            const msg = 'Matrix columns and vector dimensions are not equal!';
            console.log(msg);
            throw new Error(msg);
        }
        const multiplied = columns.rows.map((column, index) => column.map(c => c * cv.dimensions[index]));
        return new components_1.ComponentVector(multiplied[0].map((_, i) => (multiplied.map(column => column[i]).reduce((accumulator, value) => accumulator + value))));
    }
}
exports.SystemVector = SystemVector;
// data unique to system
SystemVector.epsilon = 0.00000001;
//# sourceMappingURL=systems.js.map