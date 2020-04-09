class GemTerminal implements Conductor {
    private readonly parent: Gem;
    private readonly orientation: CardinalOrientation
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

    draw(ctx: CanvasRenderingContext2D, time: number): void {
        this.parent.draw(ctx, time, this.orientation);
    }

    getPosition(): Point {
        return this.parent.getTerminalPosition(this.orientation);
    }
}

class Gem {
    private readonly center: Point;
    private readonly size: number;
    private readonly color: string;
    private draw_from: CardinalOrientation | undefined = undefined;

    private is_on = false;
    // The terminals
    private terminals: Map<CardinalOrientation, GemTerminal> = new Map();

    constructor(center_: Point, size_: number, color_: string) {
        this.center = center_;
        this.size = size_;
        this.color = color_;
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
        // Else, turn this gem on if all terminals are pwered
        this.is_on = (() => {
            for(const t of this.terminals) {
                // if any terminals are not on, return false immediately
                if(!t[1].is_on) return false;
            }
            // if all were on, the gem is powered
            return true;
        })();
    }

    draw(ctx: CanvasRenderingContext2D, time: number, orientation: CardinalOrientation) {
        // Do this so that the gem is not drawn more than once
        if(orientation === this.draw_from) {
            // draw a diamond
            ctx.beginPath();
            ctx.moveTo(this.center.x, this.center.y + this.size);
            ctx.lineTo(this.center.x + this.size, this.center.y);
            ctx.lineTo(this.center.x, this.center.y - this.size);
            ctx.lineTo(this.center.x - this.size, this.center.y);
            ctx.closePath();
            if(this.is_on){
                ctx.fillStyle = this.color;
                ctx.fill();
            } else {
                ctx.strokeStyle = this.color;
                ctx.stroke();
            }
        }
    }
}