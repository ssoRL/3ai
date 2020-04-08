/**
 * Sets up the wires and other "powered" components
 * @returns The root wire to power
 */
function init_wires(): Wire {
    // Draw some wires
    const wire0 = new Wire({x: 1000, y: 50}, {x: 800, y: 50});
    const wire1 = wire0.addStraightWireFor("vert", 50);
    const wire2 = wire1.addStraightWireFor("vert", 50);

    // TO THE COG LINE
    // Draw a wire to the upper left cogs
    const to_up_left_wire = wire1.addStraightWireFor("horz", -400);
    const up_right_cog_terminal_0: CogTerminal = { index: 0, outer: true };
    to_up_left_wire.addPoweredWiresToCogTerminal(1000, "vert", up_right_cog_terminal_0);
    to_up_left_wire.addPoweredWiresToCogTerminal(1000, "vert", {index: 6, outer: true}); 
    const up_right_cog_terminal_1: CogTerminal = { index: 4, outer: true };
    RunWire.addWireToCog(1000, up_right_cog_terminal_0, up_right_cog_terminal_1);
    RunWire.addWireToCog(1001, {index: 0, outer: false}, {index: 1, outer: true});
    RunWire.addWireToCog(1003, {index: 0, outer: false}, {index: 2, outer: true});

    // Draw wires towards the center
    const to_center_wire_0 = wire2.addStraightWireFor("vert", 50);
    const to_center_wire_1 = to_center_wire_0.addStraightWireFor("horz", -300);
    const to_center_cog_terminal: CogTerminal = {index: 5, outer: true };
    to_center_wire_1.addPoweredWiresToCogTerminal(2000, "vert", to_center_cog_terminal);
    RunWire.addWireToCog(2000, to_center_cog_terminal, {index: 1, outer: true});
    RunWire.addWireToCog(2003, {index: 0, outer: false}, {index: 1, outer: true});
    RunWire.addWireToCog(2001, {index: 5, outer: true}, {index: 4, outer: false});

    // Draw a wire down towards the bottom right cog
    const to_low_right_cog_terminal_0: CogTerminal = { index: 4, outer: false };
    wire2.addPoweredWiresToCogTerminal(3001, "horz", to_low_right_cog_terminal_0);
    RunWire.addWireToCog(3001, to_low_right_cog_terminal_0, {index: 0, outer: false});
    RunWire.addWireToCog(3000, {index: 5, outer: true}, {index: 3, outer: true});
    RunWire.addWireToCog(3002, {index: 0, outer: false}, {index: 3, outer: true});

    // Along the cog line
    // Draw the wire that will carry a charge across most of the cogs if timed right
    RunWire.betweenCogTerminals(1000, 2, 2002, 2, "vert");
    RunWire.addWireToCog(2002, {index: 7, outer: true}, {index: 3, outer: true});
    RunWire.betweenCogTerminalsThreeStep(2002, 6, 2000, 4, "vert")
    RunWire.betweenCogTerminals(2000, 0, 4001, 3, "horz");
    RunWire.addWireToCog(4001, {index: 3, outer: true}, {index: 1, outer: true});

    // Run wires to an AND gate in the upper left
    const up_left_and_gate = new AndGate(125, 400, "N");
    const wire_out_of_1003 = RunWire.awayFromCogTerminal(1003, 2);
    const up_left_wire_out = wire_out_of_1003.addStraightWireFor("vert", 100);
    const  wire_out_of_2001 = RunWire.awayFromCogTerminal(2001, 1).addStraightWireFor("vert", 50);
    up_left_wire_out.addPoweredWiresToAndTerminal(up_left_and_gate.left_terminal, "horz");
    wire_out_of_2001.addPoweredWiresToAndTerminal(up_left_and_gate.right_terminal, "horz");
    const up_left_out_of_and_wire = up_left_and_gate.getOutWire();

    // Run wires to the center right AND gate
    const center_right_and_gate = new AndGate(700, 350, "E");
    RunWire.betweenCogTerminalsThreeStep(2003, 1, 4001, 2, "horz");
    const wire_up_out_of_4001 = RunWire.awayFromCogTerminal(4001, 4);
    wire_up_out_of_4001
        .addStraightWireFor("vert", -70)
        .addStraightWireFor("horz", -80)
        .addPoweredWiresToAndTerminal(center_right_and_gate.left_terminal, "vert");
    const wire_out_of_3002 = RunWire.awayFromCogTerminal(3002, 3);
    wire_out_of_3002.addPoweredWiresToAndTerminal(center_right_and_gate.right_terminal, "vert");
    center_right_and_gate.getOutWire().addPoweredWiresToCogTerminal(3000, "horz", {index: 4, outer: true});

    // Run wires to the lower right AND gate
    const low_right_and_gate = new AndGate(490, 960, "W");
    const wire_out_of_3000 = RunWire.awayFromCogTerminal(3000, 2);
    wire_out_of_3000
        .addStraightWireFor("horz", -20)
        .addStraightWireFor("vert", 60)
        .addStraightWireFor("horz", 275)
        .addPoweredWiresToCogTerminal(4000, "vert", {index: 11, outer: true});
    RunWire.addWireToCog(4000, {index: 5, outer: true}, {index: 11, outer: true});
    const wire_out_of_4000 = RunWire.awayFromCogTerminal(4000, 5).addStraightWireFor("horz", -20);
    wire_out_of_4000.addPoweredWiresToAndTerminal(low_right_and_gate.left_terminal, "vert");
    const wire_down_out_of_4001 = RunWire.awayFromCogTerminal(4001, 1);
    wire_down_out_of_4001.addPoweredWiresToAndTerminal(low_right_and_gate.right_terminal, "vert");
    const wire_out_of_low_right_and_gate = low_right_and_gate.getOutWire().addStraightWireTo("horz", 290);

    // Run wires to the lower left AND gate
    const low_left_and_gate = new AndGate(250, 800, "W");
    wire_out_of_low_right_and_gate.addPoweredWiresToAndTerminal(low_left_and_gate.left_terminal, "vert");
    wire_out_of_2001.addStraightWireTo("horz", 290).addPoweredWiresToAndTerminal(low_left_and_gate.right_terminal, "vert");

    return wire0;
}