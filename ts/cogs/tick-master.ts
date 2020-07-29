class TickMaster {
    private ticks_left: number = 0;
    private next_tick: number = 0;
    private controlled_cogs: Cog[] = [];
    /** A promise that resolves when the next tick finishes */
    private next_tick_promise: Promise<void> | null = null;
    /** A function to call to resolve the promise of a new tick */
    private resolveTick = () => {};

    public addControlledCogs(cogs: Cog[]) {
        for(const cog of cogs) {
            this.controlled_cogs.push(cog);
        }
    }

    /** Creates a promise that resolves at the next tick */
    public atNextTick(): Promise<void> {
        if(this.next_tick === Number.POSITIVE_INFINITY || this.next_tick < glb.time) {
            // There won't be a next tick, resolve immediately
            return Promise.resolve();
        } else if(this.next_tick_promise === null) {
            // create a promise to return and return it
            this.next_tick_promise = new Promise((resolve) => {
                this.resolveTick = resolve;
            });
            return this.next_tick_promise;
        } else {
            return this.next_tick_promise;
        }
    }

    public isTicking() {
        return this.ticks_left > 0;
    }

    public checkTickStatus() {
        if(glb.time > this.next_tick) {
            // time for a new tick
            this.tick();
        }
    }

    public start(tick_n_times: number = Number.POSITIVE_INFINITY) {
        // set up some things
        this.ticks_left = tick_n_times;
        this.next_tick = performance.now();
        // then tick
        this.tick();
    }

    public stop() {
        this.ticks_left = 0;
    }

    /** Stops the ticking, and then returns a promise that resolves when the next tick would have been */
    public async stopUntilNextMissedTick() {
        this.ticks_left = 0;
        await this.atNextTick();
    }

    public time_until_next_tick(): number {
        const now = performance.now();
        if(this.next_tick === Number.POSITIVE_INFINITY || this.next_tick < now) {
            // There is no next tick
            return 0;
        } else {
            return this.next_tick - now;
        }
    }

    private tick() {
        // Complete the promise if anything depends on it
        if(this.next_tick_promise !== null) {
            this.resolveTick();
            this.next_tick_promise = null;
        }
        if(this.ticks_left > 0) {
            // Decrement how many ticks are left to take
            this.ticks_left--;
            // Set the time of the next tick
            const start_time = this.next_tick;
            this.next_tick = start_time + TICK_EVERY;
            if(this.next_tick < glb.time) {
                // When a users browser is not open, request animation frame stops being called
                // So performance.now increases such that many ticks will happen in rapid 
                // succession until next_tick catches up. To remedy that, skip ahead here
                // If next_tick has fallen behind
                this.next_tick = glb.time + TICK_EVERY;
            }
            // Send a tick signal to all of the controlled cogs
            for(const cog of this.controlled_cogs) {
                cog.startTick(start_time);
            }
        } else {
            // There are no ticks left, don't tick until start is called
            this.next_tick = Number.POSITIVE_INFINITY;
        }
    }
}