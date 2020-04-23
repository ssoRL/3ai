class CogRenderer {
    private SPUR_LENGTH = 30;
    private GAP_WIDTH = 30;

    private spur_count: number;
    private draw_path: Path2D;

    // Will calculate these
    private inner_radius: number;
    private outer_radius: number;

    // These are just fiddley constants
    private spur_offset: number;
    private arc_offset: number;

    constructor(spur_count: number) {
        this.spur_count = spur_count;
        // First calculate the inner radius. This is just the radius needed so that
        // the space between the teeth is GAP_WIDTH. The whole arc is 2 * PI * r
        // and the gap is half that divided by the spur count, so
        // GAP_WIDTH * 2 * spur_count = 2 * PI * r
        this.inner_radius = this.GAP_WIDTH * spur_count / Math.PI;
        // Then the outer radius is easy
        this.outer_radius = this.inner_radius + this.SPUR_LENGTH;
        //console.log(`For ${spur_count}: ${this.inner_radius}-${this.outer_radius}`);
        // Set the offsets
        this.spur_offset = Math.PI/(this.spur_count*this.spur_count);
        this.arc_offset = Math.PI/(this.spur_count*4);
        // Create the draw path
        this.draw_path = this.generateDrawPath();
    }

    public draw(ctx: CanvasRenderingContext2D){
        ctx.stroke(this.draw_path);
    }

    private generateDrawPath(): Path2D {
        let path = new Path2D();
        let i =0;
        for(let i=0; i< this.spur_count; i++) {
            // The angle that this section of spur starts on
            let theta_0 = i * 2 * Math.PI / this.spur_count;
            // First draw the inner cog, two arcs with a line between
            let inner_srt = theta_0 + this.spur_offset;
            let inner_end = theta_0 + Math.PI/this.spur_count - this.spur_offset
            path.arc(0, 0, this.inner_radius, inner_srt, inner_srt + this.arc_offset);
            path.arc(0, 0, this.inner_radius, inner_end - this.arc_offset, inner_end);
            // Then do the same for the outer cog part
            let outer_srt = theta_0 + Math.PI/this.spur_count + 1.5*this.spur_offset;
            let outer_end = theta_0 + 2*Math.PI/this.spur_count - 1.5*this.spur_offset
            path.arc(0, 0, this.outer_radius, outer_srt, outer_srt + this.arc_offset);
            path.arc(0, 0, this.outer_radius, outer_end - this.arc_offset, outer_end);
        }
        path.closePath();
        return path;
    }
}