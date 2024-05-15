import { ComponentMatrix, ComponentVector } from './components';
import { SystemMatrix, SystemVector } from './systems';

const cv = new ComponentVector([1, 2, 3]);
const cv2 = new ComponentVector([4, 5, 6]);
const cm = new ComponentMatrix([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
const cm2 = new ComponentMatrix([[9, 8, 7], [6, 5, 4], [3, 2, 1]]);
console.log(cv.toString());// [ 1, 2, 3 ]
console.log(cv2.toString());// [ 4, 5, 6 ]
console.log(cm.toString());// [ [ 1, 2, 3 ], [ 4, 5, 6 ], [ 7, 8, 9 ] ]
console.log(cm2.toString());// [ [ 9, 8, 7 ], [ 6, 5, 4 ], [ 3, 2, 1 ] ]
console.log(SystemVector.Add(cv, cv2).toString());// [ 5, 7, 9 ]
console.log(SystemVector.Subtract(cv, cv2).toString());// [ -3, -3, -3 ]
console.log(SystemVector.ScaleBy(cv, 2).toString());// [ 2, 4, 6 ]
console.log(SystemVector.DotProduct(cv, cv2));// 32
console.log(SystemMatrix.Columns(cm).toString());// [ [ 1, 4, 7 ], [ 2, 5, 8 ], [ 3, 6, 9 ] ]
console.log(SystemMatrix.Transpose(cm).toString());// [ [ 1, 4, 7 ], [ 2, 5, 8 ], [ 3, 6, 9 ] ]
//console.log(SystemMatrix.Determinant(cm));// 0 // an error will be thrown
console.log(SystemMatrix.Adjugate(cm).toString());// [ [ -3, 6, -3 ], [ 6, -12, 6 ], [ -3, 6, -3 ] ]
//console.log(SystemMatrix.Inverse(cm).toString());// [ [ -0, 0, 0 ], [ 0, 0, 0 ], [ -0, 0, 0 ] ]// an error will be thrown
console.log(SystemMatrix.Add(cm, cm2).toString());// [ [ 10, 10, 10 ], [ 10, 10, 10 ], [ 10, 10, 10 ] ]
console.log(SystemMatrix.Subtract(cm, cm2).toString());// [ [ -8, -6, -4 ], [ -2, 0, 2 ], [ 4, 6, 8 ] ]
console.log(SystemMatrix.ScaleBy(cm, 2).toString());// [ [ 2, 4, 6 ], [ 8, 10, 12 ], [ 14, 16, 18 ] ]
console.log(SystemMatrix.Multiply(cm, cm2).toString());// [ [ 30, 24, 18 ], [ 84, 69, 54 ], [ 138, 114, 90 ] ]