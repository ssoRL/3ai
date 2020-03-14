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
    /** The cogs that this cog drives */
    private driven_cogs: Cog[] = [];


    constructor(
        x: number,
        y: number,
        spur_count: number,
        spins_counter_clockwise: boolean,
        base_rotate = 0
    ) {
        this.x = x;
        this.y = y;
        this.spur_count = spur_count;
        this.renderer = CogRendererProvider.getRenderer(spur_count);
        // Set the starting position of the cog
        this.base_rotate = base_rotate;
        this.current_spur = 0;
        this.spins_cc = spins_counter_clockwise;
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
        // Use the renderer to draw the cog
        this.renderer.draw(ctx);
        // Draw it's driven cogs
        for(let driven_cog of this.driven_cogs){
            driven_cog.draw(ctx, time);
        }
    }

    // This will cause the cog to start a new movement cycle at the given time
    public startTick(startTime: number){
        this.current_spur = (this.current_spur + 1) % this.spur_count;
        this.tick_start = startTime;
        // Tell driven cogs to start ticking then too
        for(let driven_cog of this.driven_cogs){
            driven_cog.startTick(startTime);
        }
    }

    /**
     * Creates a new cog that is driven by this one
     * @param atIndex the index of the tooth-gap where the driven gear's tooth
     * should slot. tooth gap 0 is the gap clockwise of the base rotation. The 
     * indexing increments from there in a clockwise direction
     * @param toothCount the number of teeth in the new cog
     */
    public addDrivenCog(at_index: number, tooth_count: number){
        // Get the new cog's renderer so info on it can be gleaned
        let new_cog_renderer = CogRendererProvider.getRenderer(tooth_count);

        // First determine the position of the new cog
        let new_cog_arc = at_index * this.renderer.section_arc + this.base_rotate;
        let new_cog_r = new_cog_renderer.pitch_radius + this.renderer.pitch_radius;
        let new_cog_x = Math.cos(new_cog_arc) * new_cog_r + this.x;
        let new_cog_y = Math.sin(new_cog_arc) * new_cog_r + this.y;

        // Then, it's base rotation
        // First rotate it enough that it's 0-index tooth-gap aligns with
        // this cogs atIndex tooth-gap
        let tooth_rotate = new_cog_arc + Math.PI;
        // then shift it by half a section so it's the tooth center instead
        let new_base_rotate = tooth_rotate + new_cog_renderer.section_arc/2;

        // Create the new cog and add it to the list of driven cogs
        let new_cog = new Cog(new_cog_x, new_cog_y, tooth_count, !this.spins_cc, new_base_rotate);
        this.driven_cogs.push(new_cog);
        return new_cog;
    }
}