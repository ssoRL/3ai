class GlowingOrb {
    public size: number;
    public color: {r: number, g: number, b: number};
    private is_on: boolean;
    /** a value between 0-1 that fluctuates randomly to give a "flicker"  effect */
    private glow_flicker = 0;
    /** How much glow should be added on top of normal flicker */
    private added_glow: number;
    /** How far, in px, the glow might expand at most */
    private max_glow: number;
    /** The ratio of where the orb stops and the glowing starts */
    private center_stop: number;
    /** The ratio of where the added glow stops and the flicker starts */
    private added_stop: number;
    /** The remaining ratio */
    private flicker_part: number;

    /** The amount the the glow jitters by */
    private static readonly FLICKER = 0.05;
    /** How ofter the glow jitters in milliseconds */
    static readonly FLICKER_FREQ = 200;
    /** The event name to cause flicker */
    static readonly FLICKER_EVENT = "taiFlicker";
    /** The amount by which the orb flickers */
    static readonly FLICKER_FACTOR = 30;

    constructor(
        size_: number,
        color_: {r: number, g: number, b: number},
        is_on_ = false
    ) {
        this.size = size_;
        this.color = color_;
        this.is_on = is_on_;
        this.addGlow(0);

        // Listen for the event going out at FLICKER_FREQ to apply the flicker
        window.addEventListener(GlowingOrb.FLICKER_EVENT, () => {
            // don't do anything if the orb is off
            if(!this.is_on) return

            // make the glow amount "flicker"
            if(Math.random() > this.glow_flicker) {
                // glow's small, make it bigger
                this.glow_flicker = Math.min(1, this.glow_flicker + GlowingOrb.FLICKER);
            } else {
                // it's big, make it smaller
                this.glow_flicker = Math.max(0, this.glow_flicker - GlowingOrb.FLICKER);
            }
        });
    }

    /**
     * Turn the orb on or off and handle anything related to this action
     * @param on Whether to turn this orb on or off
     */
    power(on: boolean){
        this.is_on = on;
        // If the orb is being turned off, set the flicker to 1
        if(!this.is_on){
            this.glow_flicker = 0;
        }
    }

    /**
     * Sets the strength and derived parameters
     * @param strength The new strength of the added glow in pixels to extend the glow by
     */
    addGlow(strength: number){
        this.added_glow = strength;
        this.max_glow = this.size + GlowingOrb.FLICKER_FACTOR + strength;
        this.center_stop = this.size/this.max_glow;
        this.added_stop = this.center_stop + strength/this.max_glow;
        this.flicker_part = 1 - this.added_stop;
    }

    /**
     * Draws the glowing orb
     * @param p This is the point to draw the orb centered at, affected by transitions
     * @param x The x coordinate of the center in global coordinates, used to determine fill style
     */
    draw(p: Point, use_color: boolean) {
        if(!use_color) {
            // This is simple a black and white orb, just fill it in white
            glb.ctx.beginPath();
            glb.ctx.arc(p.x, p.y, this.size, 0, 2*Math.PI);
            glb.ctx.fillStyle = 'white';
            glb.ctx.fill();
            return;
        }

        // First draw the flat colored center
        glb.ctx.beginPath();
        glb.ctx.arc(p.x, p.y, this.size, 0, 2*Math.PI);
        glb.ctx.fillStyle = `rgb(${this.color.r},${this.color.g},${this.color.b})`
        glb.ctx.fill();

        // Then make it glow
        if(this.is_on){
            // Create a gradient stretching from near the center to the outmost possible glow radius
            // that will be hit when glow_flicker hits 1 
            const grad = glb.ctx.createRadialGradient(
                p.x, p.y, this.size/5,
                p.x, p.y, this.max_glow
            );
            grad.addColorStop(0, `rgba(255,255,255,0.8)`);
            const rgb = `${this.color.r},${this.color.g},${this.color.b}`;
            grad.addColorStop(this.center_stop, `rgba(${rgb},0.8)`);
            const glow_size = this.added_stop + this.flicker_part*this.glow_flicker;
            grad.addColorStop(glow_size, `rgba(${rgb},0)`);
            glb.ctx.fillStyle = grad;
            // fill in a larger circle
            glb.ctx.beginPath();
            glb.ctx.arc(p.x, p.y, this.max_glow, 0, Math.PI * 2);
            glb.ctx.fill();
        } else {
            // Dark
            const grad = glb.ctx.createRadialGradient(
                p.x, p.y, this.size/7,
                p.x, p.y, this.size - 1
            );
            grad.addColorStop(0, `rgba(255, 255, 255, 0.7)`);
            grad.addColorStop(1, `rgba(255, 255, 255, 0.1)`);
            glb.ctx.fillStyle = grad;
            glb.ctx.fill();
        }
    }
}

window.setInterval(() => {
    window.dispatchEvent(new CustomEvent(GlowingOrb.FLICKER_EVENT));
}, GlowingOrb.FLICKER_FREQ);