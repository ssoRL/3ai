class Cog {
    private x: number;
    private y: number;
    private renderer: CogRenderer;

    constructor(x: number, y: number, spur_count: number) {
        this.x = x;
        this.y = y;
        this.renderer = new CogRenderer(spur_count);
    }

    public draw(ctx: CanvasRenderingContext2D) {
        ctx.translate(this.x, this.y);
        ctx.rotate(Math.PI / 12);
        this.renderer.draw(ctx);
        // ctx.beginPath();
        // for(let i=0; i< this.spur_count; i++) {
        //     // The angle that this section of spur starts on
        //     let theta_0 = i * 2 * Math.PI / this.spur_count;
        //     // First draw the inner cog, two arcs with a line between
        //     let inner_srt = theta_0 + this.spur_offset;
        //     let inner_end = theta_0 + Math.PI/this.spur_count - this.spur_offset
        //     ctx.arc(0, 0, this.inner_radius, inner_srt, inner_srt + this.arc_offset);
        //     ctx.arc(0, 0, this.inner_radius, inner_end - this.arc_offset, inner_end);
        //     // Then do the same for the outer cog part
        //     let outer_srt = theta_0 + Math.PI/this.spur_count + this.spur_offset;
        //     let outer_end = theta_0 + 2*Math.PI/this.spur_count - this.spur_offset
        //     ctx.arc(0, 0, this.outer_radius, outer_srt, outer_srt + this.arc_offset);
        //     ctx.arc(0, 0, this.outer_radius, outer_end - this.arc_offset, outer_end);
        // }
        // ctx.closePath();
        // ctx.stroke();
    }
}