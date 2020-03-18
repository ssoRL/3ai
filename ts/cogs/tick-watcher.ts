/** classes that implement this can be alerted when a cog starts and stops ticking */
interface TickWatcher {
    /** The cog has started ticking towards a new position */
    startTick(new_current_tooth: number): void;
    /** The cog has arrived at a new position */
    endTick(new_current_tooth: number): void;
}