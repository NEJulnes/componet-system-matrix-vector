"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComponentMatrix = exports.ComponentVector = void 0;
// extends Object for cleaning up eslint errors for override toString()
class ComponentVector extends Object {
    constructor(dimensions) {
        super();
        this.dimensions = dimensions;
    }
    toString() {
        return '[ ' + this.dimensions.map(dimension => dimension).join(', ') + ' ]';
    }
}
exports.ComponentVector = ComponentVector;
class ComponentMatrix extends Object {
    constructor(rows) {
        super();
        this.rows = rows;
    }
    toString() {
        return '[ ' + this.rows.map(dimensions => '[ ' + dimensions.map(dimension => dimension).join(', ') + ' ]').join(', ') + ' ]';
    }
}
exports.ComponentMatrix = ComponentMatrix;
//# sourceMappingURL=components.js.map