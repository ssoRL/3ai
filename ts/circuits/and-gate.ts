/** The radius of the circle describing this AND gate */
const AND_RADIUS = 20;

class AndTerminal implements Conductor {
    public is_on = false;
    private to: AndGate;
    private is_left_terminal: boolean;
    
    constructor(to_: AndGate, is_left_terminal_: boolean){
        this.to = to_;
        this.is_left_terminal = is_left_terminal_;
    }

    public getPosition(): Point {
        return this.to.getTerminalPosition(this.is_left_terminal);
    }

    public power(on: boolean): void {
        this.is_on = on;
        this.to.power(on, this.is_left_terminal);
    }

    public draw(): void {
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
    private is_on = false;

    constructor(x_: number, y_: number, ori_: CardinalOrientation){
        this.ori = ori_;
        this.left_terminal = new AndTerminal(this, true);
        this.right_terminal = new AndTerminal(this, false);
        this.p = {x: x_, y: y_};
        this.addPoweringWire();
    }

    /**
     * Add a wire of no length at the end of the and gate
     * can run other wires away from it
     */
    private addPoweringWire() {
        const point: Point = (() => {
            switch (this.ori) {
                case "N":
                    return {x: this.p.x, y: this.p.y - AND_RADIUS};
                case "E":
                    return {x: this.p.x + AND_RADIUS, y: this.p.y};
                case "S":
                    return {x: this.p.x, y: this.p.y + AND_RADIUS};
                case "W":
                    return {x: this.p.x - AND_RADIUS, y: this.p.y};
            }
        })()
        this.powering = new Wire(point, point);
    }

    public getOutWire(){
        return this.powering;
    }

    public getTerminalPosition(is_left: boolean): Point {
        // The terminal will be along the bottom of the AND, half a radius from cneter
        const offset = AND_RADIUS / 2;
        switch (this.ori) {
            case "N":
            case "S":
                // Determine if the offset should be added or subtracted
                // Uses the ori, and whether this is the left terminal
                const cardnial_sign_x = this.ori == "N" ? 1 : -1;
                const is_left_sign_x = is_left ? -1 : 1;
                const x = this.p.x + cardnial_sign_x*is_left_sign_x*offset;
                return {x: x, y: this.p.y};
            case "E":
            case "W":
                const cardnial_sign_y = this.ori == "E" ? 1 : -1;
                const is_left_sign_y = is_left ? -1 : 1;
                const y = this.p.y + cardnial_sign_y*is_left_sign_y*offset;
                return {x: this.p.x, y: y};
        }
    }

    public power(on: boolean, from_left: boolean){
        let will_be_on: boolean;
        if(!on){
            will_be_on = false;
        } else if (from_left) {
            will_be_on = this.right_terminal.is_on;
        } else {
            will_be_on = this.left_terminal.is_on;
        }

        // check if is_on needs to be switched
        if(this.is_on !== will_be_on) {
            if(this.p.x === 700){
                if(will_be_on) {
                    //console.log(`powering up at ${performance.now()}`);
                } else {
                    //console.log(`powering down at ${performance.now()}`);
                }
            }
            this.time_switched = performance.now();
            this.is_on = will_be_on;

            window.setTimeout(
                () => {
                    if(this.p.x === 700) {
                        //console.log(`switched ${this.is_on ? 'on' : 'off'} at ${performance.now()}`);
                    }
                    this.powering.power(this.is_on);
                },
                this.is_on ? AND_POWER_UP_TIME : AND_POWER_DOWN_TIME
            )
        }
    }

    public draw() {
        // Draw a DIN AND gate
        glb.canvas_controller.setTransform();
        glb.ctx.translate(this.p.x, this.p.y);
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
        // Draw the left side base
        glb.ctx.strokeStyle = this.left_terminal.is_on ? "red" : "black";
        glb.ctx.beginPath();
        glb.ctx.moveTo(0, 0);
        glb.ctx.lineTo(-AND_RADIUS, 0);
        glb.ctx.stroke();
        // Draw the right side base
        glb.ctx.strokeStyle = this.right_terminal.is_on ? "red" : "black";
        glb.ctx.beginPath();
        glb.ctx.moveTo(0, 0);
        glb.ctx.lineTo(AND_RADIUS, 0);
        glb.ctx.stroke();
        // Draw the semi-circle top
        // Calculate the ratio of the time that's passed of the power cycle
        const power_ratio = (()=>{
            const power_time = glb.time - this.time_switched;
            if(this.is_on) {
                return power_time / AND_POWER_UP_TIME;
            } else {
                return power_time / AND_POWER_DOWN_TIME;
            }
        })();
        if(power_ratio > 1){
            // Then just draw the arc in one sweep
            glb.ctx.strokeStyle = this.is_on ? "red" : "black";
            glb.ctx.beginPath();
            glb.ctx.moveTo(-AND_RADIUS, 0);
            glb.ctx.arc(0, 0, AND_RADIUS, Math.PI, 2*Math.PI);
            glb.ctx.stroke();
        } else {
            const power_arc = power_ratio * Math.PI / 2;
            // Draw the base of the semi-circle
            glb.ctx.strokeStyle = this.is_on ? "red" : "black";
            glb.ctx.beginPath();
            glb.ctx.arc(0, 0, AND_RADIUS, 2*Math.PI - power_arc, 2*Math.PI);
            glb.ctx.moveTo(-AND_RADIUS, 0);
            glb.ctx.arc(0, 0, AND_RADIUS, Math.PI, Math.PI + power_arc);
            glb.ctx.stroke();
            // Draw the tip
            glb.ctx.strokeStyle = this.is_on ? "black" : "red";
            glb.ctx.beginPath();
            glb.ctx.arc(0, 0, AND_RADIUS, Math.PI + power_arc, 2*Math.PI - power_arc);
            glb.ctx.stroke();
        }

        this.powering.draw();
    }  
}