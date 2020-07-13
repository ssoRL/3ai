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
    private reset_height: number;
    private reset_width: number;

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

    public async animateTranslate(
        x: number, y: number, duration: number,
        easing = (t: number) => t
    ) {
        const from = {x: this.offset.x, y: this.offset.y};
        const dx = x - from.x;
        const dy = y - from.y;
        const animation_start_time = performance.now();

        const interval_handle = window.setInterval(
            () => {
                const t = glb.time;
                const fraction = (t - animation_start_time) / duration;
                const ease_frac = easing(fraction);
                this.offset = {
                    x: from.x + dx*ease_frac,
                    y: from.y + dy*ease_frac
                }
            },
            10
        );

        return new Promise((resolve) => {
            window.setTimeout(
                () => {
                    window.clearInterval(interval_handle);
                    this.offset = {x: x, y: y};
                    resolve();
                },
                duration
            );
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