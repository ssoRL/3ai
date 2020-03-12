class Cog {
    private x: number;
    private y: number;
    private skew: boolean;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 60, 0, Math.PI/6);
        let lx = 100 + 80 * Math.cos(Math.PI/4);
        let ly = 100 + 80 * Math.sin(Math.PI/4);
        ctx.lineTo(lx, ly);
        ctx.arc(this.x, this.y, 60, 2*Math.PI/6, 3*Math.PI/6);
        ctx.stroke();
    }
}