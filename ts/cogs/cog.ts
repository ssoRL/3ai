class Cog {
    private x: number;
    private y: number;
    private spur_count: number;
    private skew: boolean;
    private renderer: CogRenderer;

    constructor(x: number, y: number, spur_count: number, skew: boolean) {
        this.x = x;
        this.y = y;
        this.spur_count = spur_count;
        this.skew = skew;
        this.renderer = new CogRenderer(spur_count);
    }

    public draw(ctx: CanvasRenderingContext2D) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.translate(this.x, this.y);
        let click = Math.PI / (2 * this.spur_count)
        ctx.rotate(this.skew ? 3*click : click);
        this.renderer.draw(ctx);
    }
}