class TickMaster {
    private ticks_left: number = 0;
    private next_tick: number = 0;
    private controlled_cogs: Cog[] = [];

    public addControlledCogs(cogs: Cog[]) {
        for(const cog of cogs) {
            this.controlled_cogs.push(cog);
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

    private tick() {
        if(this.ticks_left > 0) {
            console.log(`tick ${this.ticks_left}`)
            // Decrement how many ticks are left to take
            this.ticks_left--;
            // Set the time of the next tick
            const start_time = this.next_tick;
            this.next_tick = start_time + TICK_EVERY;
            // Send a tick signal to all of the controlled cogs
            for(const cog of this.controlled_cogs) {
                cog.startTick(start_time);
            }
        }
    }
}