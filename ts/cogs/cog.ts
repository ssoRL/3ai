class Cog {
    private x: number;
    private y: number;
    private spur_count: number;
    private renderer: InvoluteCogRenderer;
    /** The most recent time that a tick was started */
    private tick_start: number = 0;
    /** The starting position of this cog */
    private base_rotate: number;
    /** The spur that the the animation is moving towards */
    private current_spur: number;
    /** The direction this cog spins. True if counter-clockwise */
    private spins_cc: boolean;


    constructor(x: number, y: number, spur_count: number, skew: boolean) {
        this.x = x;
        this.y = y;
        this.spur_count = spur_count;
        this.renderer = new InvoluteCogRenderer(spur_count);
        // Set the starting position of the cog
        this.base_rotate = skew ? 
            this.renderer.getBaseCenterArc() : 
            this.renderer.getToothCenterArc();
        this.current_spur = 0;
        this.spins_cc = skew;
    }

    public draw(ctx: CanvasRenderingContext2D, time: number) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.translate(this.x, this.y);
        // calculate the rotation
        let tick_angle = (2 * Math.PI) / this.spur_count * (this.spins_cc ? 1 : -1);
        let rest_delta = tick_angle * (this.current_spur - 1);
        let last_rest_angle = this.base_rotate + rest_delta;
        let animation_progress_t = Math.min(time - this.tick_start, TICK_LENGTH);
        let animation_progress = animation_progress_t / TICK_LENGTH;
        let animate_delta = animation_progress * tick_angle;
        ctx.rotate(last_rest_angle + animate_delta);
        this.renderer.draw(ctx);
    }

    // This will cause the cog to start a new movement cycle
    public startTick(startTime: number){
        this.current_spur = (this.current_spur + 1) % this.spur_count;
        this.tick_start = startTime;
    }
}