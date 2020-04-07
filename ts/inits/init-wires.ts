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
    RunWire.addWireToCog(1000, up_right_cog_terminal_0, up_right_cog_terminal_1);
    //RunWire.addTerminalConnectionBetweenCogs(1000, 1001);
    RunWire.addWireToCog(1001, {index: 0, outer: false}, {index: 1, outer: true});
    //RunWire.addTerminalConnectionBetweenCogs(1001, 1003);
    RunWire.addWireToCog(1003, {index: 0, outer: false}, {index: 2, outer: true});

    // Draw wires towards the center
    const to_center_wire_0 = wire2.addPoweredWire("vert", 50);
    const to_center_wire_1 = to_center_wire_0.addPoweredWire("horz", -300);
    const to_center_cog_terminal: CogTerminal = {index: 5, outer: true };
    to_center_wire_1.addPoweredWiresToCogTerminal(2000, "vert", to_center_cog_terminal);
    RunWire.addWireToCog(2000, to_center_cog_terminal, {index: 1, outer: true});
    //Cog.addTerminalConnectionBetweenCogs(2000, 2003);
    RunWire.addWireToCog(2003, {index: 0, outer: false}, {index: 1, outer: true});
    //Cog.addTerminalConnectionBetweenCogs(2000, 2001);
    RunWire.addWireToCog(2001, {index: 5, outer: true}, {index: 4, outer: false});

    // Draw a wire down towards the bottom right cog
    const to_low_right_cog_terminal_0: CogTerminal = { index: 4, outer: false };
    wire2.addPoweredWiresToCogTerminal(3001, "horz", to_low_right_cog_terminal_0);
    RunWire.addWireToCog(3001, to_low_right_cog_terminal_0, {index: 0, outer: false});
    //Cog.addTerminalConnectionBetweenCogs(3001, 3000);
    RunWire.addWireToCog(3000, {index: 5, outer: true}, {index: 3, outer: true});
    //Cog.addTerminalConnectionBetweenCogs(3000, 3002);
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
    const up_left_wire_out = wire_out_of_1003.addPoweredWire("vert", 100);
    const  wire_out_of_2001 = RunWire.awayFromCogTerminal(2001, 1);
    const  up_center_wire_out = wire_out_of_2001.addPoweredWire("horz", -50);
    up_left_wire_out.addPoweredWiresToAndTerminal(up_left_and_gate.left_terminal, "horz");
    up_center_wire_out.addPoweredWiresToAndTerminal(up_left_and_gate.right_terminal, "horz");
    const up_left_out_of_and_wire = up_left_and_gate.getOutWire();

    // Run wires to the center right AND gate
    const center_right_and_gate = new AndGate(700, 350, "E");
    RunWire.betweenCogTerminalsThreeStep(2003, 1, 4001, 2, "horz");
    const wire_up_out_of_4001 = RunWire.awayFromCogTerminal(4001, 4);
    wire_up_out_of_4001
        .addPoweredWire("vert", -70)
        .addPoweredWire("horz", -80)
        .addPoweredWiresToAndTerminal(center_right_and_gate.left_terminal, "vert");
    const wire_out_of_3002 = RunWire.awayFromCogTerminal(3002, 3);
    wire_out_of_3002.addPoweredWiresToAndTerminal(center_right_and_gate.right_terminal, "vert");
    center_right_and_gate.getOutWire().addPoweredWiresToCogTerminal(3000, "horz", {index: 4, outer: true});

    // Run wires to the lower right AND gate
    const low_right_and_gate = new AndGate(490, 960, "W");
    const wire_out_of_3000 = RunWire.awayFromCogTerminal(3000, 2);
    wire_out_of_3000
        .addPoweredWire("horz", -20)
        .addPoweredWire("vert", 60)
        .addPoweredWire("horz", 275)
        .addPoweredWiresToCogTerminal(4000, "vert", {index: 11, outer: true});
    RunWire.addWireToCog(4000, {index: 5, outer: true}, {index: 11, outer: true});
    const wire_out_of_4000 = RunWire.awayFromCogTerminal(4000, 5).addPoweredWire("horz", -20);
    wire_out_of_4000.addPoweredWiresToAndTerminal(low_right_and_gate.left_terminal, "vert");
    const wire_down_out_of_4001 = RunWire.awayFromCogTerminal(4001, 1);
    wire_down_out_of_4001.addPoweredWiresToAndTerminal(low_right_and_gate.right_terminal, "vert");

    // const high_eights_wire_away0 = Cog.leadWireAwayFromCogTerminal(1000, {index: 2, outer: true}, {x: 200, y: 400}, "vert");
    // const high_eights_wire1 = Cog.leadWireAwayFromCogTerminal(2002, {index: 1, outer: true}, {x: 240, y: 420}, "horz");
    // const high_eights_and_gate = new AndGate(150, 450, "S");
    // high_eights_wire_away0.addPoweredWiresToAndTerminal(high_eights_and_gate.right_terminal, "horz");
    // high_eights_wire1.addPoweredWiresToAndTerminal(high_eights_and_gate.left_terminal, "horz");
    // const and_away0 = high_eights_and_gate.addPoweringWire();
    // and_away0.addPoweredWire("vert", 30);

    return wire0;
}