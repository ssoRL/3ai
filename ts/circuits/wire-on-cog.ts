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
    /** The tiem it takes the power to move thru the arc part of the wire */
    private arc_wire_time: number;
    public out_terminals: CogTerminalConnector[] = [];


    /** where the power is coming from, or no if it's off */
    private power_from: "en" | "ex" | "no";
    /** When power first got to this wire */
    private time_on = 0;
    private is_on = false;

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
        this.mid_r = inner_radius / 2;

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
    }

    power(on: boolean, from: CogTerminal): void {
        if(on){
            this.time_on = new Date().getTime();
        }
        // Check if the power is coming from the en or ex terminal
        const current_en_index = this.cog.getIndexOfTooth(this.enter.index);
        const current_power_from = from.index === current_en_index ? "en" : "ex";
        if(!on && this.power_from != current_power_from) {
            // Prevent a cog wire from being shut down by a lack of power from the un-powered side
            return;
        } else {
            this.is_on = on;
            if(!on) {
                this.power_from = "no";
            } else {
                this.power_from = current_power_from;
            }
        }
        // Wait for as long as the chanrge needs to pass thru the wire, then power children
        window.setTimeout(
            () => {
                const power_from = this.power_from === "en" ? this.exit : this.enter;
                for(const out_terminal of this.out_terminals) {
                    if(this.terminalConnectedWith(out_terminal.getInTerminal(), power_from)){
                        out_terminal.power(this.is_on);
                    }
                }
                if(!this.is_on) this.power_from = "no";
            },
            this.en_wire_time + this.arc_wire_time + this.ex_wire_time
        )
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

    draw(ctx: CanvasRenderingContext2D, time: number): void {
        const time_powered = time - this.time_on;
        const total_wire_time = this.en_wire_time + this.arc_wire_time + this.ex_wire_time;
        if(!this.is_on || time_powered > total_wire_time) {
            // if the wire is off, or fully on
            ctx.strokeStyle = this.is_on ? "red" : "black";
            ctx.beginPath();
            ctx.moveTo(this.en_p0.x, this.en_p0.y);
            ctx.lineTo(this.en_p1.x, this.en_p1.y);
            ctx.arc(0, 0, this.mid_r, this.en_arc, this.ex_arc);
            ctx.lineTo(this.ex_p0.x, this.ex_p0.y);
            ctx.stroke();
        } else {
            // only going to draw some in the on color
            // determine the color that is at the en and ex points
            const en_color = this.power_from === "en" ? "red" : "black";
            const ex_color = this.power_from === "ex" ? "red" : "black";
            // determine the powered time equivilant. this is just powered time
            // if starting from the en, but from ex, it will be the inverse since
            // the red line needs to move "backwards"
            const pte = this.power_from === "en" ? time_powered : total_wire_time - time_powered;
            if(pte < this.en_wire_time){
                // The split happens on the en wire
                const mid_p: Point = {
                    x: this.en_p0.x - this.en_vec.x * pte * SOL,
                    y: this.en_p0.y - this.en_vec.y * pte * SOL,
                }
                ctx.strokeStyle = en_color;
                ctx.beginPath();
                ctx.moveTo(this.en_p0.x, this.en_p0.y);
                ctx.lineTo(mid_p.x, mid_p.y);
                ctx.stroke();
                // Then draw the rest
                ctx.strokeStyle = ex_color;
                ctx.beginPath();
                ctx.moveTo(mid_p.x, mid_p.y);
                ctx.lineTo(this.en_p1.x, this.en_p1.y);
                ctx.arc(0, 0, this.mid_r, this.en_arc, this.ex_arc);
                ctx.lineTo(this.ex_p0.x, this.ex_p0.y);
                ctx.stroke();
            } else if (pte < this.en_wire_time + this.arc_wire_time) {
                // split the arc
                const arc_time = pte - this.en_wire_time;
                // the portion of the arc passed thru
                const arc_fraction = arc_time / this.arc_wire_time;
                // Find the point where the power split happens
                const arc_split = this.en_arc + this.arc_length * arc_fraction;
                // Draw it
                ctx.strokeStyle = en_color;
                ctx.beginPath();
                ctx.moveTo(this.en_p0.x, this.en_p0.y);
                ctx.lineTo(this.en_p1.x, this.en_p1.y);
                ctx.arc(0, 0, this.mid_r, this.en_arc, arc_split);
                ctx.stroke();
                // Then draw the rest
                // First find the point to start from
                const start_p = getPoint(this.mid_r, arc_split);
                ctx.strokeStyle = ex_color;
                ctx.beginPath();
                ctx.moveTo(start_p.x, start_p.y);
                ctx.arc(0, 0, this.mid_r, arc_split, this.ex_arc);
                ctx.lineTo(this.ex_p0.x, this.ex_p0.y);
                ctx.stroke();
            } else {
                // The split is in the exit wire
                const wire_time = pte - this.en_wire_time - this.arc_wire_time;
                const mid_p: Point = {
                    x: this.ex_p1.x - this.ex_vec.x * wire_time * SOL,
                    y: this.ex_p1.y - this.ex_vec.y * wire_time * SOL,
                }
                ctx.strokeStyle = en_color;
                ctx.beginPath();
                ctx.moveTo(this.en_p0.x, this.en_p0.y);
                ctx.lineTo(this.en_p1.x, this.en_p1.y);
                ctx.arc(0, 0, this.mid_r, this.en_arc, this.ex_arc);
                ctx.lineTo(mid_p.x, mid_p.y);
                ctx.stroke();
                // Then draw the rest
                ctx.strokeStyle = ex_color;
                ctx.beginPath();
                ctx.moveTo(mid_p.x, mid_p.y);
                ctx.lineTo(this.ex_p0.x, this.ex_p0.y);
                ctx.stroke();
            }
        }
        for(const out_terminal of this.out_terminals){
            out_terminal.draw(ctx, time);
        }
    }
}