/** 
 * No matter how small or large the canvas gets, the coordinate system for
 * positioning the cogs and wires will always be between 0 and CANVAS_CANNONICAL_SIZE
 */
const CANVAS_CANNONICAL_SIZE = 1000;

class CanvasController {
    private readonly canvas: HTMLCanvasElement;
    private scale = 1;
    private clickables: Clickable[] = [];

    constructor(canvas_: HTMLCanvasElement){
        this.canvas = canvas_;

        window.addEventListener("resize", () => {
            this.updateScale();
        });
        this.updateScale();

        this.canvas.addEventListener('click', (me) => {
            console.log(`[${me.x}, ${me.y}]`)
        })
    }

    public updateScale(){
        const w = document.documentElement.clientWidth;
        const h = document.documentElement.clientHeight;
        const canvas_size = Math.min(w, h) - 20;
        this.scale = canvas_size / CANVAS_CANNONICAL_SIZE;
        this.canvas.style.width = `${canvas_size}px`;
        this.canvas.style.height = `${canvas_size}px`;
    }

    public setTransform(ctx: CanvasRenderingContext2D){
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(this.scale, this.scale);
    }

    public registerClicable(clickable: Clickable) {
        this.clickables.push(clickable);
    }
}