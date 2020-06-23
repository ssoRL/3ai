/**
 * Sets up the wires and other "powered" components
 * @returns The root wire to power
 */
function init_wires(): Wire {
    // The coordinates of the kudzu box after story
    const k_top = 50;
    const k_size = 100;
    const k_left = 1000 - 150;
    const k_pad = k_top/2;
    // Coordinates of some cog terminals
    const cog_1000 = Cog.getCogBySerialNumber(1000);
    const ct_p_1000_4 = cog_1000.getCogTerminalPoint(ct(4));
    const ct_p_1000_0 = cog_1000.getCogTerminalPoint(ct(0));
    const cog_3002 = Cog.getCogBySerialNumber(3002);
    const ct_p_3002_2 = cog_3002.getCogTerminalPoint(ct(2));
    const cog_4000 = Cog.getCogBySerialNumber(4000);
    const ct_p_4000_5 = cog_4000.getCogTerminalPoint(ct(5));
    // Draw some wires
    const wire0 = new Wire({x: 1000, y: k_pad}, {x: k_left - k_pad, y: k_pad});
    const wire1 = wire0.addStraightWireTo("vert", ct_p_1000_4.y - 20);
    const wire2 = wire1.addStraightWireTo("vert", k_top + k_size + k_pad);

    // TO THE COG LINE
    // Draw a wire to the upper left cogs
    const to_up_left_wire = wire1.addStraightWireTo("horz", ct_p_1000_0.x + 100);
    to_up_left_wire.addPoweredWiresToCogTerminal(1000, "vert", ct(0));
    to_up_left_wire.addPoweredWiresToCogTerminal(1000, "horz", ct(4)); 
    const up_right_cog_terminal_1 = ct(3);
    RunWire.addWireToCog(1000, ct(0), up_right_cog_terminal_1);
    RunWire.addWireToCog(1001, {index: 0, outer: false}, {index: 1, outer: true});
    RunWire.addWireToCog(1003, {index: 0, outer: false}, {index: 2, outer: true});

    // Draw wires towards the center
    const to_center_wire_1 = wire2.addStraightWireTo("horz", ct_p_3002_2.x - 40);
    const to_center_cog_terminal = ct(5);
    to_center_wire_1.addPoweredWiresToCogTerminal(2000, "vert", to_center_cog_terminal);
    RunWire.addWireToCog(2000, to_center_cog_terminal, {index: 1, outer: true});
    RunWire.addWireToCog(2003, {index: 0, outer: false}, {index: 1, outer: true});
    RunWire.addWireToCog(2001, {index: 5, outer: true}, {index: 4, outer: false});

    // Draw a wire down towards the middle right cog
    const to_mid_right_cog_terminal_0 = ct(3);
    wire2.addPoweredWiresToCogTerminal(3001, "horz", to_mid_right_cog_terminal_0);
    RunWire.addWireToCog(3001, to_mid_right_cog_terminal_0, { index: 9, outer: true });
    const wire_away_from_3001 = RunWire.awayFromCogTerminal(3001, 9).addStraightWireTo("vert", 790);
    const to_middle_mid_right_cog_terminal = ct(0);
    wire_away_from_3001.addPoweredWiresToCogTerminal(3000, "horz", to_middle_mid_right_cog_terminal);
    RunWire.addWireToCog(3000, ct(0), ct(3));
    RunWire.addWireToCog(3002, ct_i(0), ct(3));

    // Along the cog line
    // Draw the wire that will carry a charge across most of the cogs if timed right
    RunWire.betweenCogTerminalsThreeStep(1000, 1, 2002, 4, "vert");
    RunWire.addWireToCog(2002, {index: 11, outer: true}, {index: 5, outer: true});
    RunWire.betweenCogTerminalsThreeStep(2002, 10, 2000, 4, "vert")
    RunWire.betweenCogTerminals(2000, 0, 4001, 3, "horz");
    RunWire.addWireToCog(4001, {index: 3, outer: true}, {index: 1, outer: true});

    // Run wires to the center right AND gate
    // The x coordinate is such that the wire will run 20px left of cog 3002
    const center_right_and_gate_x = ct_p_3002_2.x - 20 + AndGate.TERMINAL_OFFSET;
    const center_right_and_gate = new AndGate(center_right_and_gate_x, 420, "N");
    RunWire.betweenCogTerminalsThreeStep(2003, 1, 4001, 2, "horz");
    const wire_up_out_of_4001 = RunWire.awayFromCogTerminal(4001, 4);
    wire_up_out_of_4001
        .addStraightWireFor("vert", -70)
        .addPoweredWiresToAndTerminal(center_right_and_gate.left_terminal, "horz");
    const wire_out_of_3002 = RunWire.awayFromCogTerminal(3002, 3).addStraightWireFor("vert", -20);
    wire_out_of_3002.addPoweredWiresToAndTerminal(center_right_and_gate.right_terminal, "horz");

    // Wire up the upper right gem
    const upper_right_gem = new Gem(p(650, 300), 40, {r:255,g:91,b:0});
    center_right_and_gate.getOutWire().addPoweredWiresToGemTerminal(
        upper_right_gem.addTerminal("W"),
        "vert"
    );
    upper_right_gem.getWireOut("E").addPoweredWiresToCogTerminal(3000, "horz", {index: 4, outer: true});

    // Run wires to the lower right AND gate
    const low_right_and_gate = new AndGate(440, ct_p_4000_5.y - AndGate.TERMINAL_OFFSET, "W");
    const wire_out_of_3000 = RunWire.awayFromCogTerminal(3000, 1).addStraightWireTo("vert", 810);
    wire_out_of_3000
        .addStraightWireTo("horz", 950)
        .addPoweredWiresToCogTerminal(4000, "vert", ct(11));
    RunWire.addWireToCog(4000, {index: 5, outer: true}, {index: 11, outer: true});
    const wire_out_of_4000 = RunWire.awayFromCogTerminal(4000, 5).addStraightWireFor("horz", -20);
    wire_out_of_4000.addPoweredWiresToAndTerminal(low_right_and_gate.left_terminal, "vert");
    const wire_down_out_of_4001 = RunWire.awayFromCogTerminal(4001, 1);
    wire_down_out_of_4001.addPoweredWiresToAndTerminal(low_right_and_gate.right_terminal, "vert");
    const wire_out_of_low_right_and_gate = low_right_and_gate.getOutWire().addStraightWireTo("horz", 290);

    // Run wires to the lower left AND gate
    const low_left_and_gate = new AndGate(250, 800, "W");
    wire_out_of_low_right_and_gate.addPoweredWiresToAndTerminal(low_left_and_gate.left_terminal, "vert");
    const  wire_out_of_2001 = RunWire.awayFromCogTerminal(2001, 1).addStraightWireFor("vert", 50);
    wire_out_of_2001.addStraightWireTo("horz", 290).addPoweredWiresToAndTerminal(low_left_and_gate.right_terminal, "vert");

    // Hook up the big gem
    const big_gem = new Gem({x: 50, y: 650}, 40, {r:255,g:91,b:0});
    const wire_out_of_1003 = RunWire.awayFromCogTerminal(1003, 2);
    wire_out_of_1003.addPoweredWiresToGemTerminal(big_gem.addTerminal("N"), "vert");
    low_left_and_gate.getOutWire().addPoweredWiresToGemTerminal(big_gem.addTerminal("S"), "horz");

    return wire0;
}