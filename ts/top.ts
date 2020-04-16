/** An array of the cogs that drive the others  */
let driver_cogs: Cog[];
/** The root wire */
let wire0: Wire;
let canvas_controller: CanvasController;

function init(){
    const canvas = <HTMLCanvasElement>document.getElementById('canvas');
    const canvas_container = <HTMLDivElement>document.getElementById('container');
    canvas_controller = new CanvasController(canvas, canvas_container);
    driver_cogs = init_cogs();
    wire0 = init_wires();

    let ctx = canvas.getContext('2d');
    if(ctx !== null){
        window.requestAnimationFrame(draw.bind(this, ctx));
        wire0.power(true);
        if(TICKING) causeTick();
    }

    // Set the actions on the READ badges
    const kudzu = document.getElementById("kudzu");
    if(kudzu) {
        kudzu.onclick = () => {
            canvas_controller.animateTranslate(500, 0, 2000);
        }
    } else {
        throw "3AI Error: There is no kudzu element"
    }
}

function causeTick(){
    let time = new Date().getTime();
    window.setTimeout(causeTick, TICK_EVERY);
    for(const cog of driver_cogs) {
        cog.startTick(time);
    }
}

function draw(ctx: CanvasRenderingContext2D) {
    let time = new Date().getTime();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, 1000, 1000);
    ctx.lineWidth = 3;
    // Draw a grid for dev stuff
    if(SHOW_HELP_GRAPICS) {
        ctx.strokeStyle = "lightBlue"
        for(let i=100; i<1000; i+= 100) {
            ctx.beginPath()
            ctx.moveTo(0, i);
            ctx.lineTo(1000, i);
            ctx.moveTo(i, 0);
            ctx.lineTo(i, 1000);
            ctx.stroke();
        }
    }
    for(const cog of driver_cogs){
        cog.draw(ctx, time);
    }
    wire0.draw(ctx, time);
    window.requestAnimationFrame(draw.bind(this, ctx));
}

window.addEventListener("DOMContentLoaded", () => {
    init();
});