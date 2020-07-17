class GemTerminal implements Conductor {
    private readonly parent: Gem;
    private readonly orientation: CardinalOrientation;
    public is_on = false;

    constructor(parent_: Gem, orientation_: CardinalOrientation){
        this.parent = parent_;
        this.orientation = orientation_;
    }

    power(on: boolean, switch_time: number): void {
        this.is_on = on;
        this.parent.power(switch_time);
    }

    draw(): void {
        this.parent.draw_thru();
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
    // The orb in the center that glows and flickers
    private orb: GlowingOrb;

    /** Function will be called when the gem is clicked */
    public onclick = async () => {};

    /** Function will be called when the gem is activated (powered for the first time) */
    public onactivated = () => {};

    /** True while there is current flowing thru the gem */
    public is_on = false;
    /** The terminals of this gem. If input, is a GemTerminal if output is a Wire */
    private terminals: Map<CardinalOrientation, GemTerminal | Wire> = new Map();

    constructor(
        center_: Point, 
        size_: number, 
        color_: {r: number, g: number, b: number}
    ) {
        this.center = center_;
        this.size = size_;
        this.color = color_;

        this.orb = new GlowingOrb(size_, color_);

        glb.canvas_controller.registerClickable(this);
    }

    /**
     * Adds a new terminal at the specified gem point
     * @param orientation 
     */
    getTerminal(orientation: CardinalOrientation): GemTerminal {
        if(this.terminals.get(orientation)){
            throw "3AI Error: cannot add the same terminal twice"
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

    power(switch_time: number){
        // Gems can't be turned off
        if(this.is_on) return;

        // Turn this gem on if all terminals are powered
        this.is_on = (() => {
            for(const t of this.terminals) {
                // if any terminals are not on, return false immediately
                if(t[1] instanceof GemTerminal && !t[1].is_on) return false;
            }
            // if all were on, the gem is powered
            return true;
        })();

        // If this gem is turned on, run the activate function and turn on the orb
        if(this.is_on) {
            this.onactivated();
            this.orb.power(true);
            this.orb.addGlow(10);
        }
    }

    private powerOut(switch_time: number) {
        // power up out wires
        for(const t of this.terminals) {
            if(t[1] instanceof Wire) t[1].power(this.is_on, switch_time);
        }
    }

    isClicked(p: Point): boolean {
        // If the gem's not on, it can't be clicked
        if(!this.is_on) return false;
        const length_and_unit_vector = getLengthAndUnitVector(p, this.center);
        return length_and_unit_vector[0] < this.size;
    }

    async click() {
        await this.onclick();
        this.powerOut(performance.now());
    }

    addGlow(glow: number){
        this.orb.addGlow(glow);
    }

    /** Draw the wires running out of this gem */
    draw_thru() {
        for(const t of this.terminals) {
            if(t[1] instanceof Wire) {
                t[1].draw();
            }
        }
    }

    draw() {
        // Draw the wire around the gem
        glb.ctx.beginPath();
        glb.ctx.arc(this.center.x, this.center.y, this.size, 0, Math.PI * 2);
        glb.ctx.strokeStyle = glb.kudzu_story_controller.getWireColor(this.center.x);
        glb.ctx.stroke();

        // Draw the glowing orb
        if(glb.kudzu_story_controller.colorInOrbs(this.center.x)) {
            this.orb.draw(this.center);
        }
    }
}