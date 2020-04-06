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
    public etched_wire: WireOnCog | undefined = undefined;
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


    constructor(
        x: number,
        y: number,
        tooth_count: number,
        driver_: Cog | SpinDirection,
        base_rotate = 0,
        //controller: CanvasController,
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
        this.tooth_count = tooth_count;
        this.renderer = CogRendererProvider.getRenderer(tooth_count);
        // Set the starting position of the cog
        this.base_rotate = base_rotate;
        this.current_tooth = 0;
        this.driver = driver_;
        if(!(this.driver instanceof Cog)) {
            canvas_controller.registerClicable(this);
        }
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

    /**
     * Adds a wire-on-cog to this cog
     * @param enter The cog terminal where the wire starts
     * @param exit The cog terminal where it leaves the cog
     * @param dir Clockwise (cw) or counter-clockwise(cc)
     */
    public static addWireToCog(cog_sn: number, enter: CogTerminal, exit: CogTerminal): WireOnCog{
        const cog = Cog.getCogBySerialNumber(cog_sn);
        if(cog.etched_wire) {
            throw "3AI Error: A cog may not have more than one wire.";
        }

        const rnd = cog.renderer;
        const wire = new WireOnCog(cog, enter, exit, rnd.outer_radius, rnd.inner_radius, rnd.section_arc);
        cog.etched_wire = wire;
        return wire;
    }

    public static addTerminalConnectionBetweenCogs(from_cog_sn: number, to_cog_sn: number): CogTerminalConnector {
        const from_cog = Cog.getCogBySerialNumber(from_cog_sn)

        let [driver_cog, driven_cog] = ((): [Cog, Cog] => {
            if(from_cog.driver instanceof Cog && from_cog.driver.serial_number === to_cog_sn){
                return [from_cog.driver, from_cog];
            } else {
                for(const cog of from_cog.driven_cogs) {
                    if(cog.serial_number === to_cog_sn) return [from_cog, cog];
                }
            }
            throw `3AI Error: Cog with serial number ${from_cog_sn} does not border cog with serial number ${to_cog_sn}`;
        })();

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
            driver_cog.serial_number === from_cog.serial_number ?
            new CogTerminalConnector(
                [driver_cog, driver_terminal],
                [driven_cog, driven_terminal]
            ) :
            new CogTerminalConnector(
                [driven_cog, driven_terminal],
                [driver_cog, driver_terminal]
            )
        );


        if(!from_cog.etched_wire) {
            throw `3AI Error: cog ${driver_cog.serial_number} does not have an etched wire`;
        }
        return terminal_connection;
    }

    public static leadWireAwayFromCogTerminal(
        cog_sn: number,
        terminal: CogTerminal,
        end_point: Point,
        ori: "horz" | "vert"
    ): Wire {
        const cog = Cog.getCogBySerialNumber(cog_sn);
        const terminal_point = cog.getCogTerminalPoint(terminal);

        // Create the wire running away from the cog
        const wire_to_elbow_p1 : Point = {
            x: ori === "horz" ? end_point.x : terminal_point.x,
            y: ori === "vert" ? end_point.y : terminal_point.y
        }
        const wire_to_elbow = new Wire(terminal_point, wire_to_elbow_p1);

        // connect that wire to the cog
        const terminal_connect = new CogTerminalConnector([cog, terminal], wire_to_elbow);
        if(!cog.etched_wire) {
            throw "3AI Error: You may not attach a terminal out from a cog with no wire!"
        }

        // Create the second part of the wire to the endpoint
        return wire_to_elbow.addPoweredWireToPoint(end_point);
    }

    public static leadWireBetweenCogTerminals(
        from_cog_sn: number,
        from_terminal: CogTerminal,
        to_cog_sn: number,
        to_terminal: CogTerminal,
        ori: "horz" | "vert"
    ) {
        const from_cog = Cog.getCogBySerialNumber(from_cog_sn);
        const to_cog = Cog.getCogBySerialNumber(to_cog_sn);
        const from_point = from_cog.getCogTerminalPoint(from_terminal);
        const to_point = to_cog.getCogTerminalPoint(to_terminal);
        const midpoint: Point = (
            ori === "horz" ?
            {x: to_point.x, y: from_point.y} : 
            {x: from_point.x, y: to_point.y}
        );
        const out_wire = new Wire(from_point, midpoint);
        new CogTerminalConnector([from_cog, from_terminal], out_wire);
        const in_wire = out_wire.addPoweredWireToPoint(to_point);
        new CogTerminalConnector(in_wire, [to_cog, to_terminal]);
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

    public draw(ctx: CanvasRenderingContext2D, time: number) {
        // Check if this cog is still ticking or not
        this.tickStatus(time);
        // First draw its driven cogs
        for(let driven_cog of this.driven_cogs){
            driven_cog.draw(ctx, time);
        }
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.translate(this.x, this.y);
        // calculate the rotation
        let tick_angle = (2 * Math.PI) / this.tooth_count;
        let rest_delta = tick_angle * this.current_tooth;
        let rest_angle = this.base_rotate + rest_delta;
        const animate_delta = this.is_ticking ? (() => {
            const animation_progress_t = Math.min(time - this.tick_start, TICK_LENGTH);
            const animation_progress = animation_progress_t / TICK_LENGTH;
            const absolute_delta = animation_progress * tick_angle;
            if(this.getSpinDirection() === SpinDirection.CLOCKWISE) {
                return absolute_delta;
            }else{
                return -1*absolute_delta;
            }
        })() : 0;
        ctx.rotate(rest_angle + animate_delta);
        ctx.fillStyle = "silver";
        ctx.strokeStyle = "slateGray";
        // Use the renderer to draw the cog
        this.renderer.draw(ctx);
        if(SHOW_HELP_GRAPICS){
            ctx.fillStyle = "black";
            // only show the serial number with dev flag
            ctx.fillText(`#${this.serial_number}`, 10, 10);
        }
        // Draw a circle in the middle, colored to represent the direction of travel
        ctx.fillStyle = (() => {
            if(this.driver instanceof Cog){
                return "slateGray"
            }
            const will_spin_clockwise = 
                (this.driver === SpinDirection.CLOCKWISE && !this.change_direction) ||
                (this.driver === SpinDirection.COUNTER_CLOCKWISE && this.change_direction);

            return will_spin_clockwise ? "orange" : "purple";
        })();
        this.driver === SpinDirection.CLOCKWISE ?
        "orange" :
        "purple";
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, 2*Math.PI);
        ctx.fill();
        // Draw it's wire if any
        if(this.etched_wire){
            this.etched_wire.draw(ctx, time);
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
        } else {
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
        let new_cog_renderer = CogRendererProvider.getRenderer(tooth_count);

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
            this.change_direction = true;
        } else {
            this.startTick(new Date().getTime());
        }
    }
}