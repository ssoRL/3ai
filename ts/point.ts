interface Point {
    x: number,
    y: number
}

/**
 * Calculates a point's position from an angle and radius
 * @param r The distance of this point from (0, 0)
 * @param a The angle of this point from 0rad
 * @returns A tuple of the point 
 */
function getPoint(r: number, a: number): Point {
    let x = r * Math.cos(a);
    let y = r * Math.sin(a);
    return {x: x, y: y};
}

function p(x: number, y: number): Point {
    return {x: x, y:y};
}

/**
 * Return the distance between two points and a unit vector pointing from p0 to p1
 * @param p0 The starting point
 * @param p1 The end point
 */
function getLengthAndUnitVector(p0: Point, p1: Point): [number, {x: number, y: number}] {
    const xd = p1.x - p0.x;
    const yd = p1.y - p0.y;
    const l = Math.sqrt(xd*xd + yd*yd);
    return [l, {x: xd/l, y: yd/l}];
}