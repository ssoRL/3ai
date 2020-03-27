class AndTerminal implements Conductor {
    public is_on = false;
    private to: AndGate;
    private is_left_terminal: boolean;
    
    constructor(to_: AndGate, is_left_terminal_: boolean){
        this.to = to_;
        this.is_left_terminal = is_left_terminal_;
    }

    public power(on: boolean): void {
        this.is_on = on;
        this.to.power(on, this.is_left_terminal);
    }

    public draw(ctx: CanvasRenderingContext2D, time: number): void {
        if(this.is_left_terminal){
            this.to.draw(ctx, time);
        }
    }

}

class AndGate {
    public left_terminal: AndTerminal;
    public right_terminal: AndTerminal;
    private powering: Wire;
    private x: number;
    private y: number;
    private is_on = false;

    constructor(x_: number, y_: number){
        this.left_terminal = new AndTerminal(this, true);
        this.right_terminal = new AndTerminal(this, false);
        this.x = x_;
        this.y = y_;
    }

    public power(on: boolean, from_left: boolean){
        if(!on){
            this.is_on = false;
        } else if (from_left) {
            this.is_on = this.right_terminal.is_on;
        } else {
            this.is_on = this.left_terminal.is_on;
        }

        this.powering.power(this.is_on);
    }

    public draw(ctx: CanvasRenderingContext2D, time: number) {
        // Just draw a triangle of 20x50 pointing down
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.strokeStyle = this.is_on ? "red" : "black";
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + 20, this.y);
        ctx.lineTo(this.x + 10, this.y + 50);
        ctx.closePath();
        ctx.stroke();
    }  
}