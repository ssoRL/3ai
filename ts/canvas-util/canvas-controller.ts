/** 
 * No matter how small or large the canvas gets, the coordinate system for
 * positioning the cogs and wires will always be between 0 and CANVAS_DEFINED_SIZE
 */
const CANVAS_DEFINED_SIZE = 1000;

class CanvasController {
    private readonly canvas: HTMLCanvasElement;
    private readonly canvas_container: HTMLDivElement;
    private scale = 1;
    public offset: Point = {x: 0, y: 0};
    private clickables: Clickable[] = [];
    /** postion the reset button in the lower right hand corner */
    private reset_height: number;
    private reset_width: number;
    /** When the current animation started */
    private animation_start_time: number;
    /** When the current animation ends */
    private animation_final_time: number;
    /** How long the animation lasts for */
    private animation_total_duration: number;
    /** The offset that the current animation is starting at */
    private animation_start_offset: Point;
    /** How much the animation shifts in the x and y direction */
    private animation_dx: number;
    private animation_dy: number;
    /** The easing function to animate with */
    private animation_easing_function: (input: number) => number;
    /** the function to resolve the animation promise, or undefined if there is no animation happening  */
    private resolveAnimation: (() => void) | undefined = undefined;

    constructor(canvas_: HTMLCanvasElement, canvas_container_: HTMLDivElement){
        this.canvas = canvas_;
        this.canvas_container = canvas_container_;

        this.setupResetButton();

        window.addEventListener("resize", () => {
            this.updateScale();
        });
        this.updateScale();

        this.canvas.addEventListener('click', (me) => {
            const clickPoint: Point = {
                x: me.offsetX/this.scale + this.offset.x,
                y: me.offsetY/this.scale + this.offset.y
            }
            for(const clickable of this.clickables) {
                if(clickable.isClicked(clickPoint)){
                    clickable.click();
                }
            }
        })
    }

    public checkAnimationStatus() {
        if (this.resolveAnimation !== undefined) {
            // There is a animation happening now
            if(glb.time > this.animation_final_time) {
                // The animation is completed, end it
                this.offset = p(
                    this.animation_start_offset.x + this.animation_dx,
                    this.animation_start_offset.y + this.animation_dy
                );
                this.resolveAnimation();
                this.resolveAnimation = undefined;
            } else {
                // set the offset correctly based on how long the animation has run
                const animation_duration = glb.time - this.animation_start_time;
                const duration_frac = animation_duration / this.animation_total_duration;
                const eased_frac = this.animation_easing_function(duration_frac);
                this.offset = p(
                    this.animation_start_offset.x + eased_frac*this.animation_dx,
                    this.animation_start_offset.y + eased_frac*this.animation_dy
                );
            }
        }
    }

    public async animateTranslate(
        x: number, y: number, duration: number,
        easing = (t: number) => t
    ) {
        if(this.resolveAnimation !== undefined) {
            // only set one animation at a time
            throw "3AI Error: Only may have one global canvas animation running at a time.";
        }

        // Set up values to track the animation
        this.animation_start_time = glb.time;
        this.animation_final_time = glb.time + duration;
        this.animation_total_duration = duration;
        this.animation_start_offset = this.offset;
        this.animation_dx = x - this.offset.x;
        this.animation_dy = y - this.offset.y;
        this.animation_easing_function = easing;

        return new Promise((resolve) => {
            this.resolveAnimation = resolve;
        })
    }

    private updateScale(){
        const canvas_size = this.canvas.clientWidth;
        this.scale = canvas_size / CANVAS_DEFINED_SIZE;
    }

    public setTransform(){
        glb.ctx.setTransform(1, 0, 0, 1, 0, 0);
        glb.ctx.translate(-this.offset.x, -this.offset.y);
    }

    public registerClickable(clickable: Clickable) {
        this.clickables.push(clickable);
    }

    public boxIsInVerticalFrame(y_top: number, height: number): boolean {
        const below_frame = y_top > this.offset.y + CANVAS_DEFINED_SIZE;
        const above_frame = y_top + height < this.offset.y;
        return !(below_frame || above_frame);
    }

    private setupResetButton() {
        const reset_button = getDocumentElementById("reset");
        this.reset_height = reset_button.clientHeight + 5;
        this.reset_width = reset_button.clientWidth + 10;
        reset_button.onclick = () => {
            Cookies.remove(ORTH_COOKIE_NAME);
            Cookies.remove(KUDZU_COOKIE_NAME);
            location.reload();
        }
    }
}