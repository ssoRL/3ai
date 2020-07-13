/** A collection of static functions used to layout wires */
class RunWire {

    /**
     * Adds a wire-on-cog to this cog
     * @param enter The cog terminal where the wire starts
     * @param exit The cog terminal where it leaves the cog
     * @param dir Clockwise (cw) or counter-clockwise(cc)
     */
    public static addWireToCog(cog_sn: number, enter: CogTerminal, exit: CogTerminal): WireOnCog{
        const cog = Cog.getCogBySerialNumber(cog_sn);
        if(cog.etched_wire) {
            throw "3AI Error: A cog may not have more than one wire.";
        }

        const r = cog.getRenderInfo();
        const wire = new WireOnCog(cog, enter, exit, r.outer_radius, r.inner_radius, r.section_arc);
        cog.etched_wire = wire;
        cog.setOutgoingConnections();
        return wire;
    }

    /**
     * Makes a zero length wire and attaches it to an outgoing cog terminal connect
     * @param cog_sn The cog to lead away from
     * @param index The tooth index to lead away from
     */
    public static awayFromCogTerminal(
        cog_sn: number,
        index: number
    ): Wire {
        const cog = Cog.getCogBySerialNumber(cog_sn);
        const terminal = {index: index, outer: true};
        const terminal_point = cog.getCogTerminalPoint(terminal);

        const wire = new Wire(terminal_point, terminal_point);

        // connect that wire to the cog
        new CogTerminalConnector(ctp(cog, terminal), wire)
        if(!cog.etched_wire) {
            throw "3AI Error: You may not attach a terminal out from a cog with no wire!"
        }

        // Create the second part of the wire to the endpoint
        return wire;
    }

    public static betweenCogTerminals(
        from_cog_sn: number,
        from_index: number,
        to_cog_sn: number,
        to_index: number,
        ori: "horz" | "vert"
    ) {
        const from_cog = Cog.getCogBySerialNumber(from_cog_sn);
        const to_cog = Cog.getCogBySerialNumber(to_cog_sn);
        const from_terminal = {index: from_index, outer: true};
        const to_terminal = {index: to_index, outer: true};
        const from_point = from_cog.getCogTerminalPoint(from_terminal);
        const to_point = to_cog.getCogTerminalPoint(to_terminal);
        const midpoint: Point = (
            ori === "horz" ?
            {x: to_point.x, y: from_point.y} : 
            {x: from_point.x, y: to_point.y}
        );
        const out_wire = new Wire(from_point, midpoint);
        new CogTerminalConnector(ctp(from_cog, from_terminal), out_wire);
        const in_wire = out_wire.addPoweredWireToPoint(to_point);
        new CogTerminalConnector(in_wire, ctp(to_cog, to_terminal));
    }

    public static betweenCogTerminalsThreeStep(
        from_cog_sn: number,
        from_index: number,
        to_cog_sn: number,
        to_index: number,
        ori: "horz" | "vert"
    ) {
        const from_cog = Cog.getCogBySerialNumber(from_cog_sn);
        const to_cog = Cog.getCogBySerialNumber(to_cog_sn);
        const from_terminal = {index: from_index, outer: true};
        const to_terminal = {index: to_index, outer: true};
        const from_point = from_cog.getCogTerminalPoint(from_terminal);
        const to_point = to_cog.getCogTerminalPoint(to_terminal);
        const midpoint_coordinate = (
            ori === "horz" ?
            (from_point.x + to_point.x) / 2 :
            (from_point.y + to_point.y) / 2
        );
        // The point leading away 
        const midpoint1: Point = (
            ori === "horz" ?
            {x: midpoint_coordinate, y: from_point.y} : 
            {x: from_point.x, y: midpoint_coordinate}
        );
        // the point before going straight to the end
        const midpoint2: Point = (
            ori === "horz" ?
            {x: midpoint_coordinate, y: to_point.y} : 
            {x: to_point.x, y: midpoint_coordinate}
        )
        const out_wire = new Wire(from_point, midpoint1);
        new CogTerminalConnector(ctp(from_cog, from_terminal), out_wire);
        const in_wire = out_wire.addPoweredWireToPoint(midpoint2).addPoweredWireToPoint(to_point);
        new CogTerminalConnector(in_wire, ctp(to_cog, to_terminal));
    }
}