enum SpinDirection {
    CLOCKWISE = 0,
    COUNTER_CLOCKWISE
}

class Cog implements Clickable{
    private static current_serial_number = 0;
    private static cog_directory: Map<number, Cog> = new Map();
    public serial_number: number;
    private x: number;
    private y: number;
    private tooth_count: number;
    private renderer: InvoluteCogRenderer;
    /** The most recent time that a tick was started */
    private tick_start: number = 0;
    /** The starting position of this cog */
    private base_rotate: number;
    /** The tooth that the cog is currently (or last) on */
    private current_tooth: number;
    /** The cogs that this cog drives */
    private driven_cogs: Cog[] = [];
    public etched_wire: WireOnCog | null;
    /** 
     * The force that determines the spin directin of this cog. Either another cog,
     * or a spin direction if it's self-driven
     */
    private driver: Cog | SpinDirection;
    /** If set true, the cog will change direction for it's next tick */
    private change_direction = false;
    private parent_index: number;
    private tick_watchers: TickWatcher[] = [];
    private is_ticking = false;
    private stopped = false;

    // Stored for use when computing wheather to bother drawing this cog
    /** The highest y axis value this cog reaches */
    private y_top: number;
    private height: number;

    private pilot_light: GlowingOrb | undefined = undefined;
    // constants for the light colors
    private static readonly RED =  {r: 255, g: 51, b: 51};
    private static readonly GREEN = {r: 0, g: 204, b: 0};


    constructor(
        x: number,
        y: number,
        tooth_count: number,
        driver_: Cog | SpinDirection,
        base_rotate = 0,
        serial_number?: number,
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
        this.tooth_count = tooth_count;
        this.renderer = CogRendererProvider.getRenderer(tooth_count, !(driver_ instanceof Cog));
        // Set the starting position of the cog
        this.base_rotate = base_rotate;
        this.current_tooth = 0;
        this.driver = driver_;
        if(!(this.driver instanceof Cog)) {
            // add driver to the clickable's list
            glb.canvas_controller.registerClicable(this);
            // and set up its pilot light
            this.pilot_light = new GlowingOrb(10, Cog.GREEN, true);
        }
        this.y_top = y - this.renderer.outer_radius;
        this.height = 2*this.renderer.outer_radius;
    }

    public static getCogBySerialNumber(cog_sn: number): Cog {
        let cog = Cog.cog_directory.get(cog_sn);
        if(!cog){
            throw `3AI Error: No cog with serial number ${cog_sn}`;
        }
        return cog;
    }

    public getCogTerminalPoint(ct: CogTerminal): Point {
        if(ct.index >= this.tooth_count){
            throw `3AI Error: Index out of bounds ${ct.index} must be less than ${this.tooth_count}`;
        }

        let section_arc = this.renderer.section_arc;
        let outer_arc_diff = ct.outer ? section_arc/2 : 0;
        let arc = this.base_rotate + ct.index * section_arc + outer_arc_diff;
        let radius = ct.outer ? this.renderer.outer_radius : this.renderer.inner_radius;
        let untransformed_p = getPoint(radius, arc);
        return {
            x: untransformed_p.x + this.x, 
            y: untransformed_p.y + this.y
        }
    }

    public getRenderInfo() {
        return {
            inner_radius: this.renderer.inner_radius,
            outer_radius: this.renderer.outer_radius,
            section_arc: this.renderer.section_arc
        }
    }

    /** Sets terminal connections to all this cog's neighbors */
    public setOutgoingConnections() {
        if(this.driver instanceof Cog){
            this.addTerminalConnectionTo(this.driver, true);
        }
        for(const cog of this.driven_cogs) {
            this.addTerminalConnectionTo(cog);
        }
    }

    /**
     * Adds a terminal connection between two cogs
     * @param to_cog_sn The serial number of the cog to connect to
     * @param this_is_driven True if this cog is driven by to_cog
     */
    private addTerminalConnectionTo(to_cog: Cog, this_is_driven = false): CogTerminalConnector {
        let [driver_cog, driven_cog]: [Cog, Cog] = (
            this_is_driven ?
            [to_cog, this] :
            [this, to_cog]
        )

        const driver_terminal: CogTerminal = {
            index: driven_cog.parent_index,
            outer: true
        };
        const driven_terminal: CogTerminal = {
            index: 0,
            outer: false
        }

        // determine what order the driver/driven are in
        const terminal_connection = (
            driver_cog.serial_number === this.serial_number ?
            new CogTerminalConnector(
                [driver_cog, driver_terminal],
                [driven_cog, driven_terminal]
            ) :
            new CogTerminalConnector(
                [driven_cog, driven_terminal],
                [driver_cog, driver_terminal]
            )
        );

        return terminal_connection;
    }

    private getSpinDirection(): SpinDirection{
        if (this.driver instanceof Cog) {
            // Spin the opposite direction as the parent
            if(this.driver.getSpinDirection() === SpinDirection.CLOCKWISE){
                return SpinDirection.COUNTER_CLOCKWISE;
            }else{
                return SpinDirection.CLOCKWISE;
            }
        } else {
            return this.driver;
        }
    }

    private tickStatus(time: number){
        if(this.is_ticking){
            if(time - this.tick_start > TICK_LENGTH){
                // Then the current tick is over
                // Update the current tooth, keeping it positive and inside the count
                this.current_tooth = this.getSpinDirection() === SpinDirection.CLOCKWISE ?
                    (this.current_tooth + 1) % this.tooth_count :
                    (this.current_tooth + this.tooth_count - 1) % this.tooth_count;
                // Notify all watchers that the tick is done
                this.is_ticking = false;
                for(const watcher of this.tick_watchers) {
                    // Notify tick watchers that a tick has started
                    watcher.endTick();
                }
            }
        }
    }

    public draw() {
        // Check if this cog is still ticking or not
        this.tickStatus(glb.time);
        // First draw its driven cogs
        for(let i=0; i<this.driven_cogs.length; i++){
            this.driven_cogs[i].draw();
        }
        // If this cog is not in frame don't draw it
        if(!glb.canvas_controller.boxIsInVerticalFrame(this.y_top, this.height)) return;
        glb.canvas_controller.setTransform();
        glb.ctx.translate(this.x, this.y);
        // calculate the rotation
        let tick_angle = (2 * Math.PI) / this.tooth_count;
        let rest_delta = tick_angle * this.current_tooth;
        let rest_angle = this.base_rotate + rest_delta;
        const animate_delta = this.is_ticking ? (() => {
            const animation_progress_t = Math.min(glb.time - this.tick_start, TICK_LENGTH);
            const animation_progress = animation_progress_t / TICK_LENGTH;
            const absolute_delta = glb.tick_easer.easeTickAnimaiton(animation_progress) * tick_angle;
            if(this.getSpinDirection() === SpinDirection.CLOCKWISE) {
                return absolute_delta;
            }else{
                return -1*absolute_delta;
            }
        })() : 0;
        const rotate = rest_angle + animate_delta;
        const swatch = glb.orth_story_controller.getCogSwatch(this.y, rotate);
        glb.ctx.rotate(rotate);
        glb.ctx.fillStyle = swatch.metal
        glb.ctx.strokeStyle = swatch.lines;
        // Use the renderer to draw the cog
        this.renderer.draw(glb.ctx);

        if(this.pilot_light && glb.orth_story_controller.done) {
            // if this is a driver cog and the orth story is over, draw a pilot light
            this.pilot_light.draw({x: 0, y: 0});
        }

        if(SHOW_HELP_GRAPICS){
            // only show the serial number with dev flag
            glb.ctx.fillStyle = "red";
            glb.ctx.fillText(`#${this.serial_number}`, 10, 10);
        }

        // Draw it's wire if any
        if(this.etched_wire){
            this.etched_wire.draw();
        }
    }

    /**
     * finds the current index position of a tooth shifted for the cog's spin
     * @param tooth the index of the tooth to get the position of
     */
    public getIndexOfTooth(tooth: number){
        return (this.current_tooth + tooth) % this.tooth_count;
    }

    // This will cause the cog to start a new movement cycle at the given time
    public startTick(startTime: number){
        // If the cog is changing direction, don't tick this cycle
        if(this.change_direction){
            // remove the change direction flag and then flip the direction of travel
            this.change_direction = false;
            if(this.driver === SpinDirection.CLOCKWISE) {
                this.driver = SpinDirection.COUNTER_CLOCKWISE;
            } else if (this.driver == SpinDirection.COUNTER_CLOCKWISE) {
                this.driver = SpinDirection.CLOCKWISE;
            }
        } else if(!this.stopped) {
            this.is_ticking = true;
            this.tick_start = startTime;
            // Tell driven cogs to start ticking then too
            for(let driven_cog of this.driven_cogs){
                driven_cog.startTick(startTime);
            }
            // Notify tick watchers that a tick has started
            for(const watcher of this.tick_watchers) {
                watcher.startTick();
            }
        }
    }

    /**
     * Creates a new cog that is driven by this one
     * @param atIndex the index of the tooth where the driven gear's tooth
     * should slot. tooth 0 is the tooth clockwise of the base rotation. The 
     * indexing increments from there in a clockwise direction
     * @param toothCount the number of teeth in the new cog
     */
    public addDrivenCog(at_index: number, tooth_count: number): Cog{
        // Get the new cog's renderer so info on it can be gleaned
        let new_cog_renderer = CogRendererProvider.getRenderer(tooth_count, false);

        // First determine the position of the new cog
        // (at_index + .5 since the teeth tops are off by half a section arc)
        let new_cog_arc = (at_index + .5) * this.renderer.section_arc + this.base_rotate;
        let new_cog_r = new_cog_renderer.pitch_radius + this.renderer.pitch_radius;
        let new_cog_x = Math.cos(new_cog_arc) * new_cog_r + this.x;
        let new_cog_y = Math.sin(new_cog_arc) * new_cog_r + this.y;

        // Then, it's base rotation
        let new_base_rotate = new_cog_arc + Math.PI;

        // Create the new cog and add it to the list of driven cogs
        let new_cog = new Cog(new_cog_x, new_cog_y, tooth_count, this, new_base_rotate);
        this.driven_cogs.push(new_cog);
        new_cog.parent_index = at_index;
        return new_cog;
    }

    public addTickWatcher(watcher: TickWatcher) {
        this.tick_watchers.push(watcher);
    }
    
    isClicked(p: Point): boolean {
        const x_diff = this.x - p.x;
        const y_diff = this.y - p.y;
        const distance = Math.sqrt(x_diff*x_diff + y_diff*y_diff);
        return distance < this.renderer.inner_radius;
    }

    click(): void {
        if(TICKING){
            if(CLICK_ACTION === "change") {
                this.change_direction = true;
            } else {
                this.stopped = !this.stopped;
            }
        } else {
            this.startTick(performance.now());
        }
    }
}