class Cog {
    private static current_serial_number = 0;
    private static cog_directory: Map<number, Cog> = new Map();
    public serial_number: number;
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
    private etched_wire: WireOnCog | null = null;


    constructor(
        x: number,
        y: number,
        spur_count: number,
        spins_counter_clockwise: boolean,
        base_rotate = 0,
        serial_number?: number
    ) {
        if(serial_number){
            if(serial_number < Cog.current_serial_number){
                throw "3AI Error: Serial Number Decrement";
            }
            Cog.current_serial_number = serial_number;
        }
        this.serial_number = Cog.current_serial_number++;
        Cog.cog_directory.set(this.serial_number, this);
        this.x = x;
        this.y = y;
        this.spur_count = spur_count;
        this.renderer = CogRendererProvider.getRenderer(spur_count);
        // Set the starting position of the cog
        this.base_rotate = base_rotate;
        this.current_spur = 0;
        this.spins_cc = spins_counter_clockwise;
    }

    public static getCogTerminalPoint(ct: CogTerminal): Point {
        let cog = Cog.cog_directory.get(ct.cogSerialNumber);
        if(!cog){
            throw `3AI Error: No cog with serial number ${ct.cogSerialNumber}`;
        }
        if(ct.index >= cog.spur_count){
            throw `3AI Error: Index out of bounds ${ct.index} must be less than ${cog.spur_count}`;
        }

        let section_arc = cog.renderer.section_arc;
        let outer_arc_diff = ct.isOuter ? section_arc/2 : 0;
        let arc = cog.base_rotate + ct.index * section_arc + outer_arc_diff;
        let radius = ct.isOuter ? cog.renderer.outer_radius : cog.renderer.inner_radius;
        let untransformed_p = getPoint(radius, arc);
        return {
            x: untransformed_p.x + cog.x, 
            y: untransformed_p.y + cog.y
        }
    }

    /**
     * Adds a wire-on-cog to this cog
     * @param enter The cog terminal where the wire starts
     * @param exit The cog terminal where it leaves the cog
     * @param dir Clockwise (cw) or counter-clockwise(cc)
     */
    public static addWireToCog(enter: CogTerminal, exit: CogTerminal): WireOnCog{
        if(enter.cogSerialNumber !== exit.cogSerialNumber){
            throw "3AI Error: The wire must start and end on the same cog";
        }
        const cog = Cog.cog_directory.get(enter.cogSerialNumber);
        if(!cog){
            throw `3AI Error: No cog with serial number ${enter.cogSerialNumber}`;
        }
        if(cog.etched_wire !== null) {
            throw "3AI Error: A cog may not have more than one wire.";
        }

        const rnd = cog.renderer;
        const wire = new WireOnCog(enter, exit, rnd.outer_radius, rnd.inner_radius, rnd.section_arc);
        cog.etched_wire = wire;
        return wire;
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
        ctx.fillStyle = "silver";
        ctx.strokeStyle = "slateGray";
        // Use the renderer to draw the cog
        this.renderer.draw(ctx);
        if(SHOW_HELP_GRAPICS){
            ctx.fillStyle = "slateGray";
            // only show the serial number with dev flag
            ctx.fillText(`#${this.serial_number}`, 0, 10);
        }
        // Draw it's wire if any
        if(this.etched_wire){
            this.etched_wire.draw(ctx, time);
        }
        // Draw its driven cogs
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