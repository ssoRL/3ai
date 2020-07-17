// Functions for setting up the gems
function makePurpleGem(p: Point) : Gem {
    const purple = {r:238,g:130,b:238};
    const purple_gem = new Gem(p, 20, purple);
    purple_gem.onclick = async() => {
        const wheels_popup = new Popup("popups/wheels-of-progress.html");
        await wheels_popup.when_closed;
    }
    return purple_gem;
}

function makeBlueGem(p: Point) : Gem {
    const blue = {r:135,g:206,b:250};
    const blue_gem = new Gem(p, 20, blue);
    blue_gem.onclick = async() => {
        const tangle_popup = new Popup("popups/tangle-of-wires.html");
        await tangle_popup.when_closed;
    }
    return blue_gem;
}

function makeGreenGem(p: Point) : Gem {
    const green = {r:0,g:255,b:127};
    const green_gem = new Gem(p, 20, green);
    green_gem.onclick = async() => {
        new Popup("popups/promise-of-perfection.html");
    }
    return green_gem;
}

function makeBigGem(p: Point) : Gem {
    const white = {r:255,g:255,b:255};
    const big_gem = new Gem(p, 40, white);
    big_gem.onclick = async() => {
        glb.perfect_story_controller.start(big_gem);
    }
    return big_gem;
}

/**
 * Sets up the wires and other "powered" components
 * @returns The root wire to power
 */
function init_wires(): {wire: Wire, gems: Gem[]} {
    // The coordinates of the boxes so wires can run without collisions
    /** How big the boxes are */
    const box_size = 100;
    /** how much space is between the box and the edge of the screen */
    const box_margin = 50;
    const box_inner_pad = box_margin/2;
    const box_outer_pad = box_size + box_margin + box_inner_pad;
    // const k_top = 50;
    // const k_left = 1000 - 150;
    // Coordinates of some cog terminals
    const cog_1000 = Cog.getCogBySerialNumber(1000);
    const ct_p_1000_4 = cog_1000.getCogTerminalPoint(ct(4));
    const ct_p_1000_0 = cog_1000.getCogTerminalPoint(ct(0));
    const ct_p_1003_2 = Cog.getCogBySerialNumber(1003).getCogTerminalPoint(ct(2));
    const ct_p_2002_2 = Cog.getCogBySerialNumber(2002).getCogTerminalPoint(ct(2));
    const cog_3002 = Cog.getCogBySerialNumber(3002);
    const ct_p_3002_2 = cog_3002.getCogTerminalPoint(ct(2));
    const cog_4000 = Cog.getCogBySerialNumber(4000);
    const ct_p_4000_5 = cog_4000.getCogTerminalPoint(ct(5));
    // Draw some wires
    const wire0 = new Wire({x: 1000, y: box_inner_pad}, {x: 1000 - box_outer_pad, y: box_inner_pad});
    const wire1 = wire0.addStraightWireTo("vert", ct_p_1000_4.y - 20);
    const wire2 = wire1.addStraightWireTo("vert", box_outer_pad);

    const returns = {
        wire: wire0,
        gems: <Gem[]>[]
    } 

    // TO THE COG LINE
    // Draw a wire to the upper left cogs
    const to_up_left_wire = wire1.addStraightWireTo("horz", ct_p_1000_0.x + 100);
    to_up_left_wire.addPoweredWiresToCogTerminal(1000, "vert", ct(0));
    to_up_left_wire.addPoweredWiresToCogTerminal(1000, "horz", ct(4));
    RunWire.addWireToCog(1000, ct(1), ct(4));
    RunWire.addWireToCog(1001, ct_i(5), ct(0));
    RunWire.addWireToCog(1003, ct_i(1), ct(3));

    // Draw wires towards the center
    const to_center_wire_1 = wire2.addStraightWireTo("horz", ct_p_3002_2.x - 40);
    to_center_wire_1.addPoweredWiresToCogTerminal(2000, "vert", ct(5));
    RunWire.addWireToCog(2000, ct(3), ct(5));
    RunWire.addWireToCog(2003, ct_i(2), ct(3));
    RunWire.addWireToCog(2001, ct(1), ct_i(0));

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
    RunWire.addWireToCog(2002, ct(9), ct(3));
    RunWire.betweenCogTerminalsThreeStep(2002, 10, 2000, 4, "vert")
    RunWire.betweenCogTerminals(2000, 0, 4001, 3, "horz");
    RunWire.addWireToCog(4001, {index: 3, outer: true}, {index: 1, outer: true});

    // Run wires to the center right AND gate
    // The x coordinate is such that the wire will run 20px left of cog 3002
    const center_right_and_gate_x = ct_p_3002_2.x - 20 + AndGate.TERMINAL_OFFSET;
    const center_right_and_gate = new AndGate(p(center_right_and_gate_x, 420), "N");
    RunWire.betweenCogTerminalsThreeStep(2003, 1, 4001, 2, "horz");
    const wire_up_out_of_4001 = RunWire.awayFromCogTerminal(4001, 4);
    wire_up_out_of_4001
        .addStraightWireFor("vert", -70)
        .addPoweredWiresToAndTerminal(center_right_and_gate.left_terminal, "horz");
    const wire_out_of_3002 = RunWire.awayFromCogTerminal(3002, 3).addStraightWireFor("vert", -20);
    wire_out_of_3002.addPoweredWiresToAndTerminal(center_right_and_gate.right_terminal, "horz");

    // Wire up the upper right gem
    const upper_right_gem = makePurpleGem(p(650, 300));
    returns.gems.push(upper_right_gem);
    center_right_and_gate.getOutWire().addPoweredWiresToGemTerminal(
        upper_right_gem.getTerminal("W"),
        "vert"
    );
    upper_right_gem.getWireOut("E").addPoweredWiresToCogTerminal(3000, "horz", {index: 4, outer: true});

    // power to the lower right gem
    const lower_right_gem = makeBlueGem(p(955, 890));
    returns.gems.push(lower_right_gem);
    const wire_out_of_3000 = RunWire.awayFromCogTerminal(3000, 1).addStraightWireTo("vert", 810);
    wire_out_of_3000.addPoweredWiresToGemTerminal(lower_right_gem.getTerminal("N"), "horz");

    // Run wires to the lower right AND gate
    const low_right_and_gate = new AndGate(p(440, ct_p_4000_5.y - AndGate.TERMINAL_OFFSET), "W");
    lower_right_gem
        .getWireOut("S")
        .addPoweredWiresToCogTerminal(4000, "vert", ct(11));
    RunWire.addWireToCog(4000, {index: 5, outer: true}, {index: 11, outer: true});
    const wire_out_of_4000 = RunWire.awayFromCogTerminal(4000, 5).addStraightWireFor("horz", -20);
    wire_out_of_4000.addPoweredWiresToAndTerminal(low_right_and_gate.left_terminal, "vert");
    const wire_down_out_of_4001 = RunWire.awayFromCogTerminal(4001, 1);
    wire_down_out_of_4001.addPoweredWiresToAndTerminal(low_right_and_gate.right_terminal, "vert");
    const wire_out_of_low_right_and_gate = low_right_and_gate.getOutWire().addStraightWireTo("horz", 290);

    // Run wires to the lower left AND gate
    const low_left_and_gate = new AndGate(p(ct_p_1003_2.x, 775), "N");
    wire_out_of_low_right_and_gate
        .addStraightWireTo("horz", box_outer_pad)
        .addStraightWireTo('vert', 1000 - box_outer_pad)
        .addPoweredWiresToAndTerminal(low_left_and_gate.left_terminal, "horz");
    const  wire_out_of_2001 = RunWire
        .awayFromCogTerminal(2001, 1)
        .addStraightWireTo("vert", 1000 - box_outer_pad - 20);
    wire_out_of_2001.addPoweredWiresToAndTerminal(low_left_and_gate.right_terminal, "horz");

    // Hook up the left gem
    const left_gem = makeGreenGem(p(ct_p_1003_2.x, 600));
    returns.gems.push(left_gem);
    low_left_and_gate
        .getOutWire()
        .addPoweredWiresToGemTerminal(left_gem.getTerminal("S"), "vert");

    // Run wires to the upper left AND gate
    const upper_left_and_gate = new AndGate(p(ct_p_1003_2.x + 20, ct_p_2002_2.y), "E");
    RunWire
        .awayFromCogTerminal(1003, 2)
        .addPoweredWiresToAndTerminal(upper_left_and_gate.left_terminal, "vert");
    left_gem
        .getWireOut("N")
        .addPoweredWiresToAndTerminal(upper_left_and_gate.right_terminal, "vert");

    // Hook up the big gem
    const big_gem = makeBigGem(p(450, 580));
    returns.gems.push(big_gem);
    upper_left_and_gate
        .getOutWire()
        .addStraightWireFor("horz", 7)
        .addPoweredWiresToCogTerminal(2002, "vert", ct(1));
    RunWire
        .awayFromCogTerminal(2002, 7)
        .addPoweredWiresToGemTerminal(big_gem.getTerminal("N"), "horz");
    // wire_out_of_1003.addPoweredWiresToGemTerminal(big_gem.addTerminal("N"), "vert");
    // low_left_and_gate.getOutWire().addPoweredWiresToGemTerminal(big_gem.addTerminal("S"), "horz");

    return returns;
}