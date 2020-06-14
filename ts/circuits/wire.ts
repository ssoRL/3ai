type WireOrientation = "horz" | "vert";

class Wire implements Conductor {
    private p0: Point;
    private p1: Point;
    /** The unit vector from p0 to p1 */
    private vec: {x: number, y: number};
    /** The number of milliseconds it takes charge to pass thru this wire */
    private wire_time: number;
    /** Whether there is power running to this wire */
    private is_on = false;
    /** When the last on/off signal arrived */
    private time_switched = 0;

    /** A list of the conductors this is powering */
    private powering: Conductor[] = [];

    constructor(p0_: Point, p1_: Point){
        this.p0 = p0_;
        this.p1 = p1_;
        const length_and_vec = getLengthAndUnitVector(p0_, p1_);
        this.vec = length_and_vec[1];
        // wire time is the length of wire divided by speed of light
        this.wire_time = length_and_vec[0] / SOL;
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
     * that the lines will be horizontal or vertical
     * @param orientation Whether this is a horizontal or vertical wire
     * @param l The length of the new wire
     */
    public addStraightWireFor(orientation: WireOrientation, l: number): Wire {
        let p = orientation === "horz" ?
            {x: this.p1.x + l, y: this.p1.y} :
            {x: this.p1.x, y: this.p1.y + l};
        return this.addPoweredWireToPoint(p);
    }

    /**
     * Creates a new child wire stretching away from this one, choosing a point such
     * that the lines will be horizontal or vertical
     * @param orientation Whether this is a horizontal or vertical wire
     * @param target the x or y coordinate to end on
     */
    public addStraightWireTo(orientation: WireOrientation, target: number): Wire {
        let p = orientation === "horz" ?
            {x: target, y: this.p1.y} :
            {x: this.p1.x, y: target};
        return this.addPoweredWireToPoint(p);
    }
    
    public addPoweredWiresToAndTerminal(terminal: AndTerminal, ori: WireOrientation): Wire {
        const terminal_p = terminal.getPosition();
        const wire = this.addWiresToPoint(terminal_p, ori);
        wire.powering.push(terminal);
        return wire;
    }

    public addPoweredWiresToCogTerminal(cog_sn: number, ori: WireOrientation, terminal: CogTerminal) {
        const cog = Cog.getCogBySerialNumber(cog_sn);
        const terminal_p = cog.getCogTerminalPoint(terminal);
        const wire = this.addWiresToPoint(terminal_p, ori);
        const terminal_connector =  new CogTerminalConnector(wire, [cog, terminal]);
        wire.powering.push(terminal_connector);
    }

    public addPoweredWiresToGemTerminal(terminal: GemTerminal, ori: WireOrientation) {
        const terminal_p = terminal.getPosition();
        const wire = this.addWiresToPoint(terminal_p, ori);
        wire.powering.push(terminal);
        return wire;
    }

    /**
     * Creates two wires running at right angles from this wire's p1
     * to a specified point, 
     * @param terminal_p The point to end at
     * @param ori Whether this wire should start running horizontal or vertical
     * @returns The second wire that was created to hook to as needed
     */
    private addWiresToPoint(terminal_p: Point, ori: WireOrientation): Wire {
        // Draw the wire running to the elbow, in the direction specified by ori
        const length_to_elbow = ori === "horz" ?
            terminal_p.x - this.p1.x :
            terminal_p.y - this.p1.y; 
        const wire_to_elbow = this.addStraightWireFor(ori, length_to_elbow);
        // Draw the other wire segment, running to the terminal
        const length_to_terminal = ori === "vert" ?
            terminal_p.x - this.p1.x :
            terminal_p.y - this.p1.y;
        const alt_orientation = ori === "horz" ? "vert" : "horz";
        return wire_to_elbow.addStraightWireFor(alt_orientation, length_to_terminal);
    }

    public addTerminalConnectionToChildren(terminal: CogTerminalConnector): void{
        this.powering.push(terminal);
    }

    power(on: boolean): void {
        if(this.is_on !== on) {
            this.time_switched = performance.now();
            this.is_on = on;
            window.setTimeout(
                () => {
                    for(let conductor of this.powering){
                        conductor.power(this.is_on);
                    }
                },
                this.wire_time
            );
        }
    }

    draw() {
        glb.canvas_controller.setTransform();
        const time_powered = glb.time - this.time_switched;
        const wire_off_color = glb.kudzu_story_controller.getWireColor();
        const wire_on_color = 'lightGray'
        if(time_powered < this.wire_time){
            // Determine which color is new, and which old
            const newColor = this.is_on ? wire_on_color : wire_off_color;
            const oldColor = !this.is_on ? wire_on_color : wire_off_color;
            // If the wire is in the middle of being powered...
            const p_half: Point = {
                x: this.p0.x + this.vec.x * time_powered * SOL,
                y: this.p0.y + this.vec.y * time_powered * SOL
            }
            // ...draw this wire in white as far as the power has gotten...
            glb.ctx.strokeStyle = newColor;
            glb.ctx.beginPath();
            glb.ctx.moveTo(this.p0.x, this.p0.y);
            glb.ctx.lineTo(p_half.x, p_half.y);
            glb.ctx.stroke();
            // ...then the rest in wire off color
            glb.ctx.strokeStyle = oldColor;
            glb.ctx.beginPath();
            glb.ctx.moveTo(p_half.x, p_half.y);
            glb.ctx.lineTo(this.p1.x, this.p1.y);
            glb.ctx.stroke();
            // finally draw a spark where the interface is
            Spark.draw(p_half);
        } else {
            // If the wire is full on or off, draw with only one color
            let color = this.is_on ? wire_on_color : wire_off_color;
            glb.ctx.strokeStyle = color;
            glb.ctx.beginPath();
            glb.ctx.moveTo(this.p0.x, this.p0.y);
            glb.ctx.lineTo(this.p1.x, this.p1.y);
            glb.ctx.stroke();
        }
        for(let i=0; i<this.powering.length; i++) {
            this.powering[i].draw();
        }
    }
}