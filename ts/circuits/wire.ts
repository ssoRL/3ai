class Wire implements Conductor {
    private p0: Point;
    private p1: Point;
    private isOn = false;

    private children: Conductor[] = [];

    constructor(p0_: Point, p1_: Point){
        this.p0 = p0_;
        this.p1 = p1_;
    }

    /**
     * Creates a new child wire stretching away from p1
     * @param p The starting point of the wire
     * @param orientation Whether this is a horizontal or vertical wire
     * @param l The length of the wire
     */
    public addChildWire(orientation: "horz" | "vert", l: number): Wire {
        let p0_ = this.p1;
        let p1_ = orientation === "horz" ?
            {x: p0_.x + l, y: p0_.y} :
            {x: p0_.x, y: p0_.y + l};
        let wire_ = new Wire(p0_, p1_);
        this.children.push(wire_);
        return wire_;
    }

    public addChildToTerminal(orientation: "horz" | "vert", terminal: CogTerminal): Wire {
        const terminal_p = Cog.getCogTerminalPoint(terminal);
        const length_to_elbow = orientation === "horz" ?
            terminal_p.x - this.p1.x :
            terminal_p.y - this.p1.y; 
        const wire_to_elbow = this.addChildWire(orientation, length_to_elbow);
        const length_to_terminal = orientation === "vert" ?
            terminal_p.x - this.p1.x :
            terminal_p.y - this.p1.y;
        const alt_orientation = orientation === "horz" ? "vert" : "horz";
        return wire_to_elbow.addChildWire(alt_orientation, length_to_terminal);
    }

    powerUp(): void {
        this.isOn = true;
        for(let child of this.children){
            child.powerUp(this.p1);
        }
    }
    powerDn(): void {
        this.isOn = false;
        for(let child of this.children){
            child.powerDn(this.p1);
        }
    }

    draw(ctx: CanvasRenderingContext2D, time: number) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        let color = this.isOn ? "red" : "black";
        ctx.strokeStyle = color;
        ctx.moveTo(this.p0.x, this.p0.y);
        ctx.lineTo(this.p1.x, this.p1.y);
        ctx.stroke();
        for(let child of this.children){
            child.draw(ctx, time);
        }
    }
}