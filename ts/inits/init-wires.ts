/**
 * Sets up the wires and other "powered" components
 * @returns The root wire to power
 */
function init_wires(): Wire {
    // Draw some wires
    const wire0 = new Wire({x: 1000, y: 50}, {x: 800, y: 50});
    const wire1 = wire0.addPoweredWire("vert", 50);
    const wire2 = wire1.addPoweredWire("vert", 50);

    // TO THE COG LINE
    // Draw a wire to the upper left cogs
    const to_up_left_wire = wire1.addPoweredWire("horz", -400);
    const up_right_cog_terminal_0: CogTerminal = { index: 0, outer: true };
    to_up_left_wire.addPoweredWiresToCogTerminal(1000, "vert", up_right_cog_terminal_0);
    to_up_left_wire.addPoweredWiresToCogTerminal(1000, "vert", {index: 6, outer: true}); 
    const up_right_cog_terminal_1: CogTerminal = { index: 4, outer: true };
    Cog.addWireToCog(1000, up_right_cog_terminal_0, up_right_cog_terminal_1);
    Cog.addTerminalConnectionBetweenCogs(1000, 1001);
    Cog.addWireToCog(1001, {index: 0, outer: false}, {index: 1, outer: true});
    Cog.addTerminalConnectionBetweenCogs(1001, 1003);
    Cog.addWireToCog(1003, {index: 0, outer: false}, {index: 2, outer: true});

    // Draw wires towards the center
    const to_center_wire_0 = wire2.addPoweredWire("vert", 50);
    const to_center_wire_1 = to_center_wire_0.addPoweredWire("horz", -300);
    const to_center_cog_terminal: CogTerminal = {index: 5, outer: true };
    to_center_wire_1.addPoweredWiresToCogTerminal(2000, "vert", to_center_cog_terminal);
    Cog.addWireToCog(2000, to_center_cog_terminal, {index: 1, outer: true});
    Cog.addTerminalConnectionBetweenCogs(2000, 2003);
    Cog.addWireToCog(2003, {index: 0, outer: false}, {index: 1, outer: true});
    Cog.addTerminalConnectionBetweenCogs(2000, 2001);
    Cog.addWireToCog(2001, {index: 5, outer: true}, {index: 4, outer: false});

    // Draw a wire down towards the bottom right cog
    const to_low_right_cog_terminal_0: CogTerminal = { index: 4, outer: false };
    wire2.addPoweredWiresToCogTerminal(3001, "horz", to_low_right_cog_terminal_0);
    Cog.addWireToCog(3001, to_low_right_cog_terminal_0, {index: 0, outer: false});
    Cog.addTerminalConnectionBetweenCogs(3001, 3000);
    Cog.addWireToCog(3000, {index: 5, outer: true}, {index: 3, outer: true});
    Cog.addTerminalConnectionBetweenCogs(3000, 3002);
    Cog.addWireToCog(3002, {index: 0, outer: false}, {index: 4, outer: true});

    // Along the cog line
    // Draw the wire that will carry a charge across most of the cogs if timed right
    Cog.leadWireBetweenCogTerminals(1000, {index: 2, outer: true}, 2002, {index: 1, outer: true}, "vert");




    // const high_eights_wire_away0 = Cog.leadWireAwayFromCogTerminal(1000, {index: 2, outer: true}, {x: 200, y: 400}, "vert");
    // const high_eights_wire1 = Cog.leadWireAwayFromCogTerminal(2002, {index: 1, outer: true}, {x: 240, y: 420}, "horz");
    // const high_eights_and_gate = new AndGate(150, 450, "S");
    // high_eights_wire_away0.addPoweredWiresToAndTerminal(high_eights_and_gate.right_terminal, "horz");
    // high_eights_wire1.addPoweredWiresToAndTerminal(high_eights_and_gate.left_terminal, "horz");
    // const and_away0 = high_eights_and_gate.addPoweringWire();
    // and_away0.addPoweredWire("vert", 30);

    return wire0;
}