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