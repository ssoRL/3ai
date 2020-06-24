/**
 * Sets up the wires to the right of the screen, shown during kudzu story
 * @returns The root wire to power
 */
function init_kudzu_wires(): [Wire, Gem] {
    // Draw some wires
    const wire0 = new Wire({x: 4200, y: 300}, {x: 4100, y: 300});
    // run a wire above the view and then back
    const wire_over_view = wire0
        .addStraightWireFor("vert", -1000)
        .addStraightWireFor("horz", -1300)
        .addStraightWireFor("vert", 1000);

    const wire_into_frame_from_left = wire_over_view.addStraightWireFor("horz", 250);

    const wire_over_words = wire_into_frame_from_left
        .addStraightWireFor("vert", -50)
        .addStraightWireFor("horz", 850)
        .addStraightWireFor("vert", -300);

    const wire_under_words = wire_into_frame_from_left
        .addStraightWireFor("vert", 550)
        .addStraightWireFor("horz", 800);

    const wire_into_frame_from_right = wire0.addStraightWireFor("horz", -150);

    const and_gate = new AndGate(p(3800, 925), "W");

    wire_into_frame_from_right.addPoweredWiresToAndTerminal(and_gate.left_terminal, "vert");
    wire_under_words.addPoweredWiresToAndTerminal(and_gate.right_terminal, "vert");

    const gem = new Gem({x: 3500, y: 925}, 30, {r:160,g:32,b:240});
    and_gate.getOutWire().addPoweredWiresToGemTerminal(gem.addTerminal("E"), "vert");

    const wire_out_of_frame = gem.getWireOut("W").addStraightWireTo("horz", 1500);
    // Have this wire meet up with the wire0 of the main view
    wire_out_of_frame.addStraightWireTo("vert", 50).addStraightWireTo("horz", 1000);
    // and also randomly away
    wire_out_of_frame.addStraightWireFor("vert", 1000);

    return [wire0, gem];
}