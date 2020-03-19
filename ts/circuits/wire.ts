class Wire implements Conductor {
    private p0: Point;
    private p1: Point;
    private isOn = false;

    /** A list of the conductors this is powering */
    private powering: Conductor[] = [];

    constructor(p0_: Point, p1_: Point){
        this.p0 = p0_;
        this.p1 = p1_;
    }

    /**
     * Creates a new wire attached to this one
     * @param p the point where the new wire will end
     */
    public addPoweredWireToPoint(p: Point): Wire {
        let p0_ = this.p1;
        let wire_ = new Wire(p0_, p);
        this.powering.push(wire_);
        return wire_;
    }

    /**
     * Creates a new child wire stretching away from this one, choosing a point such
     * that the lines will be horizonal or vertical
     * @param p The starting point of the wire
     * @param orientation Whether this is a horizontal or vertical wire
     * @param l The length of the wire
     */
    public addPoweredWire(orientation: "horz" | "vert", l: number): Wire {
        let p = orientation === "horz" ?
            {x: this.p1.x + l, y: this.p1.y} :
            {x: this.p1.x, y: this.p1.y + l};
        return this.addPoweredWireToPoint(p);
    }

    public addPoweredWiresToTerminal(cog_sn: number, orientation: "horz" | "vert", terminal: CogTerminal): CogTerminalConnector {
        const cog = Cog.getCogBySerialNumber(cog_sn);
        const terminal_p = cog.getCogTerminalPoint(terminal);
        const length_to_elbow = orientation === "horz" ?
            terminal_p.x - this.p1.x :
            terminal_p.y - this.p1.y; 
        const wire_to_elbow = this.addPoweredWire(orientation, length_to_elbow);
        const length_to_terminal = orientation === "vert" ?
            terminal_p.x - this.p1.x :
            terminal_p.y - this.p1.y;
        const alt_orientation = orientation === "horz" ? "vert" : "horz";
        const wire_from_elbow = wire_to_elbow.addPoweredWire(alt_orientation, length_to_terminal);
        return wire_from_elbow.addTerminalConnectionToChildren(cog, terminal);
    }

    public addTerminalConnectionToChildren(cog: Cog, terminal: CogTerminal): CogTerminalConnector{
        const terminal_connect = new CogTerminalConnector(this, [cog, terminal]);
        this.powering.push(terminal_connect);
        return terminal_connect;
    }

    power(on: boolean): void {
        this.isOn = on;
        for(let conductor of this.powering){
            conductor.power(on);
        }
    }

    draw(ctx: CanvasRenderingContext2D, time: number) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        let color = this.isOn ? "red" : "black";
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(this.p0.x, this.p0.y);
        ctx.lineTo(this.p1.x, this.p1.y);
        ctx.stroke();
        for(let conductor of this.powering){
            conductor.draw(ctx, time);
        }
    }
}