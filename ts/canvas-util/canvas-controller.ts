/** 
 * No matter how small or large the canvas gets, the coordinate system for
 * positioning the cogs and wires will always be between 0 and CANVAS_CANNONICAL_SIZE
 */
const CANVAS_CANNONICAL_SIZE = 1000;

class CanvasController {
    private readonly canvas: HTMLCanvasElement;
    private readonly canvas_container: HTMLDivElement;
    private scale = 1;
    private clickables: Clickable[] = [];

    constructor(canvas_: HTMLCanvasElement, canvas_container_: HTMLDivElement){
        this.canvas = canvas_;
        this.canvas_container = canvas_container_;

        window.addEventListener("resize", () => {
            this.updateScale();
        });
        this.updateScale();

        this.canvas.addEventListener('click', (me) => {
            const clickPoint: Point = {
                x: me.offsetX/this.scale,
                y: me.offsetY/this.scale
            }
            for(const clickable of this.clickables) {
                if(clickable.isClicked(clickPoint)){
                    clickable.click();
                }
            }
        })
    }

    public updateScale(){
        const w = document.documentElement.clientWidth;
        const h = document.documentElement.clientHeight;
        const canvas_size = Math.min(w, h) - 20;
        this.scale = canvas_size / CANVAS_CANNONICAL_SIZE;
        this.canvas_container.style.width = `${canvas_size}px`;
        this.canvas_container.style.height = `${canvas_size}px`;
    }

    public setTransform(ctx: CanvasRenderingContext2D){
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(this.scale, this.scale);
    }

    public registerClicable(clickable: Clickable) {
        this.clickables.push(clickable);
    }
}