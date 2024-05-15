// extends Object for cleaning up eslint errors for override toString()
class ComponentVector extends Object {
    public readonly dimensions: number[];
    public constructor(dimensions: number[]) {
        super();
        this.dimensions = dimensions;
    }
    public override toString() {
        return '[ ' + this.dimensions.map(dimension => dimension).join(', ') + ' ]';
    }
}

class ComponentMatrix extends Object {
    public readonly rows: number[][];
    public constructor(rows: number[][]) {
        super();
        this.rows = rows;
    }
    public override toString() {
        return '[ ' + this.rows.map(dimensions => '[ ' + dimensions.map(dimension => dimension).join(', ') + ' ]').join(', ') + ' ]';
    }
}

export { ComponentVector, ComponentMatrix };