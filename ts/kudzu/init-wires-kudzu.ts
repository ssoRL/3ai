/**
 * Sets up the wires to the right of the screen, shown during kudzu story
 * @returns The root wire to power
 */
function init_kudzu_wires(): Wire {
    // Draw some wires
    const wire0 = new Wire({x: 1000, y: 100}, {x: 3050, y: 100});
    const wire1 = wire0.addStraightWireFor("vert", 130);

    return wire0;
}