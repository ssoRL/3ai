class WireOnCog implements Conductor{
    /** The cog terminal where this wire starts */
    private enter: CogTerminal;
    /** The point were the wire starts (in the cog's coordinate frame) */
    private en_p0: Point;
    /** The point in the middle of the cog that the wire runs towards after enter */
    private en_p1: Point;
    /** The angle that the wire starts at */
    private en_arc: number;
    /** The exit cog terminal. Everything uses a similar description as above */
    private exit: CogTerminal;
    private ex_p0: Point;
    private ex_p1: Point;
    private ex_arc: number;

    /** The radius of the circle that the wire inscribes in the arc */
    private mid_r: number;

    constructor(
        enter_: CogTerminal, 
        exit_: CogTerminal, 
        outer_radius: number, 
        inner_radius: number,
        section_arc: number
    ) {
        this.enter = enter_;
        this.exit = exit_;

        // calculate the arcs
        this.en_arc = section_arc * enter_.index + (enter_.isOuter ? section_arc/2 : 0);
        this.ex_arc = section_arc * exit_.index + (exit_.isOuter ? section_arc/2 : 0);

        // Get the distance that the various points will be from the center
        const en_r = enter_.isOuter ? outer_radius : inner_radius;
        const ex_r = exit_.isOuter ? outer_radius : inner_radius;
        this.mid_r = inner_radius / 2;

        // calculate the points 
        this.en_p0 = getPoint(en_r, this.en_arc);
        this.en_p1 = getPoint(this.mid_r, this.en_arc);
        this.ex_p0 = getPoint(ex_r, this.ex_arc);
        this.ex_p1 = getPoint(this.mid_r, this.ex_arc);
    }

    powerUp(source?: Point | CogTerminal): void {
        throw new Error("Method not implemented.");
    }

    powerDn(source?: Point | CogTerminal): void {
        throw new Error("Method not implemented.");
    }

    draw(ctx: CanvasRenderingContext2D, time: number): void {
        ctx.moveTo(this.en_p0.x, this.en_p0.y);
        ctx.lineTo(this.en_p1.x, this.en_p1.y);
        ctx.arc(0, 0, this.mid_r, this.en_arc, this.ex_arc);
        ctx.lineTo(this.ex_p0.x, this.ex_p0.y);
        ctx.stroke();
    }
}