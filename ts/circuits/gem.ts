class GemTerminal implements Conductor {
    private readonly parent: Gem;
    private readonly orientation: CardinalOrientation;
    public is_on = false;

    constructor(parent_: Gem, orientation_: CardinalOrientation){
        this.parent = parent_;
        this.orientation = orientation_;
    }

    power(on: boolean): void {
        this.is_on = on;
        if(on) {
            this.parent.power();
        }
    }

    draw(): void {
        this.parent.draw(this.orientation);
    }

    getPosition(): Point {
        return this.parent.getTerminalPosition(this.orientation);
    }
}

class Gem implements Clickable {
    private readonly center: Point;
    private readonly size: number;
    private draw_from: CardinalOrientation | undefined = undefined;
    private readonly color: {r: number, g: number, b: number};
    public onclick: () => void;
    /** The glow amount, between 0 and 1 */
    private glow = 0;
    /** The amount the the glow jitters by */
    private static readonly GLOW_JITTER = 0.05;
    /** How ofter the glow jitters in milliseconds */
    private static readonly JITTER_FREQ = 200;

    private is_on = false;
    // The terminals
    private terminals: Map<CardinalOrientation, GemTerminal | Wire> = new Map();

    constructor(
        center_: Point, 
        size_: number, 
        color_: {r: number, g: number, b: number}
    ) {
        this.center = center_;
        this.size = size_;
        this.color = color_;

        glb.canvas_controller.registerClicable(this);
    }

    /**
     * Adds a new terminal at the specified gem point
     * @param orientation 
     */
    addTerminal(orientation: CardinalOrientation): GemTerminal {
        if(this.terminals.get(orientation)){
            throw "3AI Error: cannont add the same terminal twice"
        }
        // If there is no terminal assigned to draw this gem, use this one
        if(!this.draw_from){
            this.draw_from = orientation;
        }
        const terminal = new GemTerminal(this, orientation);
        this.terminals.set(orientation, terminal);
        return terminal;
    }

    getWireOut(orientation: CardinalOrientation): Wire {
        const terminal = this.terminals.get(orientation);
        if(terminal instanceof GemTerminal) {
            throw "3AI Error: Already an in terminal at this position"
        } else if (terminal instanceof Wire) {
            return terminal;
        }
        const p = this.getTerminalPosition(orientation);
        const out_wire = new Wire(p, p);
        this.terminals.set(orientation, out_wire);
        return out_wire;
    }

    getTerminalPosition(orientation: CardinalOrientation): Point {
        switch(orientation) {
            case "N": 
                return {x: this.center.x, y: this.center.y - this.size}
            case "E":
                return {x: this.center.x + this.size, y: this.center.y}
            case "S":
                return {x: this.center.x, y: this.center.y + this.size}
            case "W":
                return {x: this.center.x - this.size, y: this.center.y}
        }
    }

    power(){
        // Once a gem is on, it will stay on;
        if(this.is_on) return;
        // Else, turn this gem on if all terminals are powered
        this.is_on = (() => {
            for(const t of this.terminals) {
                // if any terminals are not on, return false immediately
                if(t[1] instanceof GemTerminal && !t[1].is_on) return false;
            }
            // if all were on, the gem is powered
            return true;
        })();

        if(this.is_on) {
            // glow to start expanding
            this.jitter();
        }
    }

    powerOut() {
        // power up out wires
        for(const t of this.terminals) {
            if(t[1] instanceof Wire) t[1].power(this.is_on);
        }
    }

    isClicked(p: Point): boolean {
        const lnuv = getLengthAndUnitVector(p, this.center);
        return lnuv[0] < this.size;
    }

    click(): void {
        console.log("clicked")
        this.onclick();
    }

    draw(orientation: CardinalOrientation) {
        // Do this so that the gem is not drawn more than once
        if(orientation === this.draw_from) {
            // draw a circle and fill it in
            glb.ctx.beginPath();
            //glb.ctx.moveTo(this.center.x + this.size, this.center.y);
            glb.ctx.arc(this.center.x, this.center.y, this.size, 0, Math.PI * 2);
            glb.ctx.fillStyle = `rgb(${this.color.r},${this.color.g},${this.color.b})`;
            glb.ctx.strokeStyle = glb.kudzu_story_controller.getWireColor(this.center.x);
            glb.ctx.fill();
            glb.ctx.stroke();

            if(this.is_on){
                const grad = glb.ctx.createRadialGradient(
                    this.center.x, this.center.y, this.size/5,
                    this.center.x, this.center.y, this.size*3
                );
                grad.addColorStop(0, `rgba(255,255,255,0.8)`);
                grad.addColorStop(1/3, `rgba(${this.color.r},${this.color.g},${this.color.b},0.8)`);
                grad.addColorStop(.5*(1+this.glow), `rgba(${this.color.r},${this.color.g},${this.color.b},0)`);
                glb.ctx.fillStyle = grad;
                // fill in a larger circle
                glb.ctx.beginPath();
                glb.ctx.arc(this.center.x, this.center.y, this.size*3, 0, Math.PI * 2);
                glb.ctx.fill();
            } else {
                // Dark
                const grad = glb.ctx.createRadialGradient(
                    this.center.x, this.center.y, this.size/5,
                    this.center.x, this.center.y, this.size
                );
                grad.addColorStop(0, "rgba(0, 0, 0, 0.2)");
                grad.addColorStop(1, "rgba(0, 0, 0, 0.8)");
                glb.ctx.fillStyle = grad;
                glb.ctx.fill();
            }
        }

        for(const t of this .terminals) {
            if(t[1] instanceof Wire) {
                t[1].draw();
            }
        }
    }

    private jitter() {
        if(Math.random() > this.glow) {
            // glow's small, make it bigger
            this.glow = Math.min(1, this.glow + Gem.GLOW_JITTER);
        } else {
            // it's big, make it smaller
            this.glow = Math.max(0, this.glow - Gem.GLOW_JITTER);
        }

        window.setTimeout(() => {this.jitter()}, Gem.JITTER_FREQ);
    }
}