/** 
 * Easing function between 0 and 1 that rises as a square exponential to x_peak at t=t_peak
 * then falls back to 1 at t=1 
 * */
class TickEaser {
    /** The highest point of the return of the easing function */
    readonly x_peak: number;
    /** half of the peak */
    readonly x_half_peak: number;
    /** half of the amound of the fall back to 1 from the peak */
    readonly x_half_fall: number;
    /** The point (between 0 and 1) when the highest value is returned */
    readonly t_peak: number;
    readonly t_half_peak: number;
    /** The speed at which the function rises to half of the peak */
    readonly rise_factor: number;
    readonly half_fall_duration: number;
    readonly t_half_fall: number;
    /** The speed at which the functions falls from half of the peak to 1 */
    readonly fall_factor: number;

    // Save the last value of t. Since all cogs tick at the same time they'll all
    // be requesting the same easing answer at the same time. Don't keep recalculating it
    /** The last t calculated */
    private last_t = 0;
    /** The last value returned */
    private last_x = 0;
    readonly allow_diff = 0.01;

    constructor(x_peak_: number, t_peak_: number) {
        //x_peak = 1.15;
        this.x_peak = x_peak_;
        this.x_half_peak = this.x_peak/2;
        this.x_half_fall = (this.x_peak - 1)/2;
        //t_peak = 0.85;
        this.t_peak = t_peak_;
        this.t_half_peak = this.t_peak/2;
        this.rise_factor = 1/this.t_half_peak;
        this.half_fall_duration = (1 - this.t_peak)/2;
        this.t_half_fall = this.t_peak + this.half_fall_duration;
        this.fall_factor = 1/this.half_fall_duration;
    }

    public easeTickAnimaiton(t: number): number{
        //First check if the current t is the same as the last computed
        const diff = t - this.last_t;
        if(diff < this.allow_diff && diff > -this.allow_diff) {
            //console.log("hit");
            return this.last_x;
        }
        //console.log(`miss ${diff}`);

        const x = (() => {
            if(t < this.t_half_peak) {
                // A t^2 going to x_peak/2 in t_peak/2
                const t_from_0 = t * this.rise_factor;
                return this.x_half_peak * t_from_0 * t_from_0;
            } else if (t < this.t_peak) {
                const t_to_peak = (this.t_peak - t) * this.rise_factor;
                return this.x_peak - this.x_half_peak * t_to_peak * t_to_peak;
            } else if (t < this.t_half_fall) {
                const t_from_peak = (t - this.t_peak)*this.fall_factor;
                return this.x_peak - this.x_half_fall * t_from_peak * t_from_peak;
            } else if(t < 1) {
                const t_to_end = (1 - t)*this.fall_factor;
                return 1 + this.x_half_fall * t_to_end * t_to_end;
            } else {
                return 1;
            }
        })();

        this.last_t = t;
        this.last_x = x;
        return x;
    }
}