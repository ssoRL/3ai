class WireOnCog {
    /** The cog this wire is on */
    private cog: Cog;
    /** The cog terminal where this wire starts */
    private enter: CogTerminal;
    /** The point were the wire starts (in the cog's coordinate frame) */
    private en_p0: Point;
    /** The point in the middle of the cog that the wire runs towards after enter */
    private en_p1: Point;
    /** The unit vector from en_p0 to en_p1 */
    private en_vec: {x: number, y: number};
    /** The angle that the wire starts at */
    private en_arc: number;
    /** The time in milliseconds it takes power to pass thru the enter wire */
    private en_wire_time: number;
    /** The exit cog terminal. Everything uses a similar description as above */
    private exit: CogTerminal;
    private ex_p0: Point;
    private ex_p1: Point;
    /** The unit vector from ex_p1 to ex_p0, i.e., going away from the center */
    private ex_vec: {x: number, y: number};
    private ex_arc: number;
    private ex_wire_time: number;
    /** The time in milliseconds it takes for the power to move thru the arc part */
    /** The length of the arc in radians */
    private arc_length: number;
    /** The time it takes the power to move thru the arc part of the wire */
    private arc_wire_time: number;
    /** The total time taken to pass this wire */
    private wire_time: number;

    /** List of the cog terminals this pushes power to */
    public out_terminals: CogTerminalConnector[] = [];


    /** where the power is coming from, or no if it's off */
    private power_from: "en" | "ex" | "no";
    /** Time when the wire was last switched on */
    private switch_time = 0;
    private power_state = Power.OFF;

    /** The radius of the circle that the wire inscribes in the arc */
    private mid_r: number;

    constructor(
        cog_: Cog,
        enter_: CogTerminal, 
        exit_: CogTerminal, 
        outer_radius: number, 
        inner_radius: number,
        section_arc: number
    ) {
        this.cog = cog_;
        this.enter = enter_;
        this.exit = exit_;

        // calculate the arcs
        this.en_arc = section_arc * enter_.index + (enter_.outer ? section_arc/2 : 0);
        this.ex_arc = section_arc * exit_.index + (exit_.outer ? section_arc/2 : 0);

        // Get the distance that the various points will be from the center
        const en_r = enter_.outer ? outer_radius : inner_radius;
        const ex_r = exit_.outer ? outer_radius : inner_radius;
        this.mid_r = 2* inner_radius / 3;

        // calculate the points 
        this.en_p0 = getPoint(en_r, this.en_arc);
        this.en_p1 = getPoint(this.mid_r, this.en_arc);
        this.ex_p0 = getPoint(ex_r, this.ex_arc);
        this.ex_p1 = getPoint(this.mid_r, this.ex_arc);

        // Calculate the wire times and vectors
        // Find the arc length, taking into account the en_arc might be bigger than ex_arc
        this.arc_length = this.ex_arc - this.en_arc > 0 ?
            this.ex_arc - this.en_arc :
            this.ex_arc - this.en_arc + 2*Math.PI;
        this.arc_wire_time = this.arc_length * this.mid_r / SOL;
        const en_wire_info = getLengthAndUnitVector(this.en_p1, this.en_p0);
        const ex_wire_info = getLengthAndUnitVector(this.ex_p0, this.ex_p1);
        this.en_vec = en_wire_info[1];
        this.ex_vec = ex_wire_info[1];
        this.en_wire_time = en_wire_info[0]/SOL;
        this.ex_wire_time = ex_wire_info[0]/SOL;
        this.wire_time = this.en_wire_time + this.ex_wire_time + this.arc_wire_time;
    }

    /** Call this when the underlying cog starts ticking */
    startTick(start_tick_time: number) {
        this.power_state = Power.OFF;
        this.power_from = "no";
        // Send the end tick signal to all out terminals
        for(const out_terminal of this.out_terminals) {
            out_terminal.startTick(start_tick_time);
        }
    }

    private power_from_end(from_cog_terminal: CogTerminal): "en" | "ex" | "no" {
        // Is it from the en side?
        const current_en_index = this.cog.getIndexOfTooth(this.enter.index);
        if(current_en_index === from_cog_terminal.index){
            return "en"
        }

        // Is it from the ex side?
        const current_ex_index = this.cog.getIndexOfTooth(this.exit.index);
        if(current_ex_index === from_cog_terminal.index){
            return "ex"
        }

        return "no";
    }

    power(on: boolean, from: CogTerminal, switch_time: number): void {
        if(isOn(this.power_state) === on) {
            // ignore redundant signal
            return
        }

        const powered_end = this.power_from_end(from);
        if(powered_end === "no") {
            // Not from a connected terminal, ignore it
            return;
        }

        if(on) {
            this.power_from = powered_end;
            this.switch_time = switch_time;
            this.power_state = Power.UP;
        } else {
            this.power_from = "no";
            this.power_state = Power.OFF;
            // in this case, propagate the off message instantly
            for(const out_terminal of this.out_terminals) {
                out_terminal.power(false, switch_time);
            }
        }
    }

    /**
     * Checks if a given terminal touches the wire
     * @param terminal The terminal in un-rotated tooth index
     * @param end_point The endpoint of the wire to test
     */
    private terminalConnectedWith(
        terminal: CogTerminal,
        end_point: CogTerminal
    ): boolean {
        if(terminal.outer !== end_point.outer) return false;
        return terminal.index === this.cog.getIndexOfTooth(end_point.index);
    }

    public isConnectedWith(terminal: CogTerminal): boolean {
        return this.terminalConnectedWith(terminal, this.enter) ||
            this.terminalConnectedWith(terminal, this.exit);
    }

    checkPowerStatus(time_since_switch: number) {
        // If the power has had time to propagate
        if(time_since_switch >= this.wire_time) {
            // is this wire now on?
            const on = isOn(this.power_state)
            // send the signal to the next conductors in line
            // The time that the wire was powered thru (can be in the past)
            const switch_time = glb.time - (time_since_switch - this.wire_time);
            for(let outs of this.out_terminals){
                outs.power(on, switch_time);
            }
            // Set power_state of this wire
            this.power_state = on ? Power.ON : Power.OFF;
        }
    }

    draw(): void {
        const wire_off_color = glb.kudzu_story_controller.getWireColor(this.cog.getCenter().x);
        if(isTransition(this.power_state)) {
            // Determine if the wire should switch to full on
            const time_since_switch = glb.time - this.switch_time;
            this.checkPowerStatus(time_since_switch);
            // ensure this is still in transition
            if(isTransition(this.power_state)){
                // only going to draw some in the on color
                // determine the color that is at the en and ex points
                const en_color = this.power_from === "en" ? WIRE_ON_COLOR : wire_off_color;
                const ex_color = this.power_from === "ex" ? WIRE_ON_COLOR : wire_off_color;
                // determine the powered time equivalent. this is just powered time
                // if starting from the en, but from ex, it will be the inverse since
                // the red line needs to move "backwards"
                const pte = this.power_from === "en" ? time_since_switch : this.wire_time - time_since_switch;
                if(pte < this.en_wire_time){
                    // The split happens on the en wire
                    const mid_p: Point = {
                        x: this.en_p0.x - this.en_vec.x * pte * SOL,
                        y: this.en_p0.y - this.en_vec.y * pte * SOL,
                    }
                    glb.ctx.strokeStyle = en_color;
                    glb.ctx.beginPath();
                    glb.ctx.moveTo(this.en_p0.x, this.en_p0.y);
                    glb.ctx.lineTo(mid_p.x, mid_p.y);
                    glb.ctx.stroke();
                    // Then draw the rest
                    glb.ctx.strokeStyle = ex_color;
                    glb.ctx.beginPath();
                    glb.ctx.moveTo(mid_p.x, mid_p.y);
                    glb.ctx.lineTo(this.en_p1.x, this.en_p1.y);
                    glb.ctx.arc(0, 0, this.mid_r, this.en_arc, this.ex_arc);
                    glb.ctx.lineTo(this.ex_p0.x, this.ex_p0.y);
                    glb.ctx.stroke();
                    Spark.draw(mid_p);
                } else if (pte < this.en_wire_time + this.arc_wire_time) {
                    // split the arc
                    const arc_time = pte - this.en_wire_time;
                    // the portion of the arc passed thru
                    const arc_fraction = arc_time / this.arc_wire_time;
                    // Find the point where the power split happens
                    const arc_split = this.en_arc + this.arc_length * arc_fraction;
                    // Draw it
                    glb.ctx.strokeStyle = en_color;
                    glb.ctx.beginPath();
                    glb.ctx.moveTo(this.en_p0.x, this.en_p0.y);
                    glb.ctx.lineTo(this.en_p1.x, this.en_p1.y);
                    glb.ctx.arc(0, 0, this.mid_r, this.en_arc, arc_split);
                    glb.ctx.stroke();
                    // Then draw the rest
                    // First find the point to start from
                    const start_p = getPoint(this.mid_r, arc_split);
                    glb.ctx.strokeStyle = ex_color;
                    glb.ctx.beginPath();
                    glb.ctx.moveTo(start_p.x, start_p.y);
                    glb.ctx.arc(0, 0, this.mid_r, arc_split, this.ex_arc);
                    glb.ctx.lineTo(this.ex_p0.x, this.ex_p0.y);
                    glb.ctx.stroke();
                    Spark.draw(start_p);
                } else {
                    // The split is in the exit wire
                    const wire_time = pte - this.en_wire_time - this.arc_wire_time;
                    const mid_p: Point = {
                        x: this.ex_p1.x - this.ex_vec.x * wire_time * SOL,
                        y: this.ex_p1.y - this.ex_vec.y * wire_time * SOL,
                    }
                    glb.ctx.strokeStyle = en_color;
                    glb.ctx.beginPath();
                    glb.ctx.moveTo(this.en_p0.x, this.en_p0.y);
                    glb.ctx.lineTo(this.en_p1.x, this.en_p1.y);
                    glb.ctx.arc(0, 0, this.mid_r, this.en_arc, this.ex_arc);
                    glb.ctx.lineTo(mid_p.x, mid_p.y);
                    glb.ctx.stroke();
                    // Then draw the rest
                    glb.ctx.strokeStyle = ex_color;
                    glb.ctx.beginPath();
                    glb.ctx.moveTo(mid_p.x, mid_p.y);
                    glb.ctx.lineTo(this.ex_p0.x, this.ex_p0.y);
                    glb.ctx.stroke();
                    Spark.draw(mid_p);
                }
            } else {
                this.drawSolidColor(wire_off_color);
            }
        } else {
            this.drawSolidColor(wire_off_color);
        }
        for(let i=0; i<this.out_terminals.length; i++){
            this.out_terminals[i].draw();
        }
    }

    /** Draw this as one solid color */
    drawSolidColor(wire_off_color: string | CanvasGradient) {
        glb.ctx.strokeStyle = isOn(this.power_state) ? WIRE_ON_COLOR : wire_off_color;
        glb.ctx.beginPath();
        glb.ctx.moveTo(this.en_p0.x, this.en_p0.y);
        glb.ctx.lineTo(this.en_p1.x, this.en_p1.y);
        glb.ctx.arc(0, 0, this.mid_r, this.en_arc, this.ex_arc);
        glb.ctx.lineTo(this.ex_p0.x, this.ex_p0.y);
        glb.ctx.stroke();
    }
}