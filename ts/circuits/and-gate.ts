class AndTerminal implements Conductor {
    public is_on = false;
    private to: AndGate;
    private is_left_terminal: boolean;
    private p: Point;
    
    constructor(to_: AndGate, is_left_terminal_: boolean){
        this.to = to_;
        this.is_left_terminal = is_left_terminal_;
        this.p = this.to.getTerminalPosition(this.is_left_terminal);
    }

    public getPosition(): Point {
        return this.p;
    }

    public power(on: boolean, switch_time: number): void {
        this.is_on = on;
        this.to.power(on, this.is_left_terminal, switch_time);
    }

    public draw(): void {
        if(this.is_on && !this.to.isOn()) {
            // Draw a spark as the the current is 'waiting' here
            Spark.draw(this.p);
        }

        if(this.is_left_terminal){
            this.to.draw();
        }
    }

}

class AndGate {
    public left_terminal: AndTerminal;
    public right_terminal: AndTerminal;
    private powering: Wire;
    /** The point centered between the two terminals */
    private p: Point;
    private ori: CardinalOrientation;
    private time_switched = 0;
    private power_state = Power.OFF;
    private orb: GlowingOrb;

    /** The radius of the circle describing this AND gate */
    private static readonly RADIUS = 25;
    /** The terminal will be along the bottom of the AND, half a radius from center */
    public static readonly TERMINAL_OFFSET = AndGate.RADIUS / 2;
    private static readonly ORB_COLOR = {r: 200, g: 200, b: 0};
    private static readonly MAX_GLOW = 45;

    constructor(p_: Point, ori_: CardinalOrientation){
        this.ori = ori_;
        this.p = p_;
        this.left_terminal = new AndTerminal(this, true);
        this.right_terminal = new AndTerminal(this, false);
        this.addPoweringWire();
        this.orb = new GlowingOrb(AndGate.RADIUS/2.4, AndGate.ORB_COLOR, false);
    }

    /**
     * Add a wire of no length at the end of the and gate
     * can run other wires away from it
     */
    private addPoweringWire() {
        const point: Point = (() => {
            switch (this.ori) {
                case "N":
                    return {x: this.p.x, y: this.p.y - AndGate.RADIUS};
                case "E":
                    return {x: this.p.x + AndGate.RADIUS, y: this.p.y};
                case "S":
                    return {x: this.p.x, y: this.p.y + AndGate.RADIUS};
                case "W":
                    return {x: this.p.x - AndGate.RADIUS, y: this.p.y};
            }
        })()
        this.powering = new Wire(point, point);
    }

    public getOutWire(){
        return this.powering;
    }

    public getTerminalPosition(is_left: boolean): Point {
        switch (this.ori) {
            case "N":
            case "S":
                // Determine if the offset should be added or subtracted
                // Uses the ori, and whether this is the left terminal
                const cardinal_sign_x = this.ori == "N" ? 1 : -1;
                const is_left_sign_x = is_left ? -1 : 1;
                const x = this.p.x + cardinal_sign_x*is_left_sign_x*AndGate.TERMINAL_OFFSET;
                return {x: x, y: this.p.y};
            case "E":
            case "W":
                const cardinal_sign_y = this.ori == "E" ? 1 : -1;
                const is_left_sign_y = is_left ? -1 : 1;
                const y = this.p.y + cardinal_sign_y*is_left_sign_y*AndGate.TERMINAL_OFFSET;
                return {x: this.p.x, y: y};
        }
    }

    public power(on: boolean, from_left: boolean, switch_time: number){
        let will_be_on: boolean;
        if(!on){
            will_be_on = false;
        } else if (from_left) {
            will_be_on = this.right_terminal.is_on;
        } else {
            will_be_on = this.left_terminal.is_on;
        }

        // check if is_on needs to be switched
        if(isOn(this.power_state) !== will_be_on) {
            this.time_switched = switch_time;
            this.power_state = will_be_on ? Power.UP : Power.DOWN;

            // If this is powering up turn on the orb
            if(will_be_on) {
                this.orb.power(will_be_on)
            }
        }
    }

    public isOn(){
        return isOn(this.power_state);
    }

    /** Call this each draw cycle to determine if this wire is done */
    private checkPowerStatus(time_since_switch: number, time_to_switch_out: number) {
        // is this gate moving towards the on or off state
        const to_on = isOn(this.power_state)
        if(time_since_switch >= time_to_switch_out) {
            // send the signal to the next conductors in line
            // The time that the wire was powered thru (can be in the past)
            const switch_time = glb.time - (time_since_switch - time_to_switch_out)
            this.powering.power(to_on, switch_time);
            
            // Set power_state of this wire
            this.power_state = to_on ? Power.ON : Power.OFF;

            // handle the orb
            if(to_on) {
                // bring it to maximum glow
                this.orb.addGlow(AndGate.MAX_GLOW)
            } else {
                // turn it off
                this.orb.power(false);
            }
        }
    }

    public draw() {
        this.powering.draw();
        // Draw a DIN AND gate
        glb.canvas_controller.setTransform();
        glb.ctx.translate(this.p.x, this.p.y);
        const off_wire_color = glb.kudzu_story_controller.getWireColor(this.p.x);
        // orient it
        const rotation: number = (()=>{
            switch(this.ori){
                case "N":
                    return 0;
                case "E": 
                    return Math.PI/2;
                case "S":
                    return Math.PI;
                case "W":
                    return -Math.PI/2;
            }
        })();
        glb.ctx.rotate(rotation);

        // Draw the AND shape
        glb.ctx.beginPath();
        // The base
        glb.ctx.moveTo(AndGate.RADIUS, 0);
        glb.ctx.lineTo(-AndGate.RADIUS, 0);
        // Draw the semi-circle top
        glb.ctx.arc(0, 0, AndGate.RADIUS, Math.PI, 2*Math.PI);
        if(glb.kudzu_story_controller.isDone()) {
            glb.ctx.fillStyle = off_wire_color;
            glb.ctx.fill();
        } else {
            glb.ctx.strokeStyle = off_wire_color;
            glb.ctx.stroke();
        }

        // check the status
        if(isTransition(this.power_state)) {
            const time_since_switch = glb.time - this.time_switched;
            const time_to_switch_out = isOn(this.power_state) ? AND_POWER_UP_TIME : AND_POWER_DOWN_TIME;
            this.checkPowerStatus(time_since_switch, time_to_switch_out);
            // if still transitional, animate the orb's glow
            if(isTransition(this.power_state)) {
                const charge_ratio = time_since_switch/time_to_switch_out;
                const glow_ratio = 1 - charge_ratio;
                this.orb.addGlow(glow_ratio*AndGate.MAX_GLOW);
            }
        }
        // Then place an orb in the center
        if(glb.kudzu_story_controller.colorInOrbs(this.p.x)) {
            this.orb.draw(p(0, -AndGate.RADIUS/2.2));
        }
    }  
}