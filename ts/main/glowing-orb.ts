class GlowingOrb {
    public size: number;
    public color: {r: number, g: number, b: number};
    public is_on: boolean;
    /** a value between 0-1 that fluctuates randomly to give a "flicker"  effect */
    private glow = 0;

    /** The amount the the glow jitters by */
    private static readonly FLICKER = 0.05;
    /** How ofter the glow jitters in milliseconds */
    static readonly FLICKER_FREQ = 200;
    /** The event name to cause flicker */
    static readonly FLICKER_EVENT = "taiFlicker";
    /** How far the glow reaches in multiples of the main orb's radius */
    private static readonly GLOW_RADIUS = 3;
    // some derived constants
    private static readonly END_CENTER_STOP = 1/GlowingOrb.GLOW_RADIUS;
    private static readonly GLOW_STOP = 1 - GlowingOrb.END_CENTER_STOP;

    constructor(size_: number, color_: {r: number, g: number, b: number}, is_on_ = false) {
        this.size = size_;
        this.color = color_;
        this.is_on = is_on_;

        // Listen for the event going out at FLICKER_FREQ to apply the flicker
        window.addEventListener(GlowingOrb.FLICKER_EVENT, () => {
            // don't do anything if the orb is off
            if(!this.is_on) {
                this.glow = 0;
                return;
            }

            // make the glow amount "flicker"
            if(Math.random() > this.glow) {
                // glow's small, make it bigger
                this.glow = Math.min(1, this.glow + GlowingOrb.FLICKER);
            } else {
                // it's big, make it smaller
                this.glow = Math.max(0, this.glow - GlowingOrb.FLICKER);
            }
        });
    }

    draw(p: Point) {
        // First draw the flat colored center
        glb.ctx.beginPath();
        glb.ctx.arc(p.x, p.y, this.size, 0, 2*Math.PI);
        glb.ctx.fillStyle = `rgb(${this.color.r},${this.color.g},${this.color.b})`
        glb.ctx.fill();

        // Then make it glow
        if(this.is_on){
            const grad = glb.ctx.createRadialGradient(
                p.x, p.y, this.size/5,
                p.x, p.y, this.size*GlowingOrb.GLOW_RADIUS
            );
            grad.addColorStop(0, `rgba(255,255,255,0.8)`);
            grad.addColorStop(GlowingOrb.END_CENTER_STOP, `rgba(${this.color.r},${this.color.g},${this.color.b},0.8)`);
            const glow_size = GlowingOrb.END_CENTER_STOP + GlowingOrb.GLOW_STOP*this.glow;
            grad.addColorStop(glow_size, `rgba(${this.color.r},${this.color.g},${this.color.b},0)`);
            glb.ctx.fillStyle = grad;
            // fill in a larger circle
            glb.ctx.beginPath();
            glb.ctx.arc(p.x, p.y, this.size*GlowingOrb.GLOW_RADIUS, 0, Math.PI * 2);
            glb.ctx.fill();
        } else {
            // Dark
            const grad = glb.ctx.createRadialGradient(
                p.x, p.y, this.size/5,
                p.x, p.y, this.size
            );
            grad.addColorStop(0, "rgba(0, 0, 0, 0.2)");
            grad.addColorStop(1, "rgba(0, 0, 0, 0.8)");
            glb.ctx.fillStyle = grad;
            glb.ctx.fill();
        }
    }
}

window.setInterval(() => {
    window.dispatchEvent(new CustomEvent(GlowingOrb.FLICKER_EVENT));
}, GlowingOrb.FLICKER_FREQ);