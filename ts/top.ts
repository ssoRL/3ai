let cog12: Cog, cog6: Cog;

function init(){
    cog12 = new Cog(200, 200, 12, true);
    cog6 = new Cog(200 + 153 + 153/*76*/, 200,12, false);
    let canvas : HTMLCanvasElement | null = <HTMLCanvasElement>document.getElementById('canvas');
    let ctx = canvas.getContext('2d');
    if(ctx !== null){
        window.requestAnimationFrame(draw.bind(this, ctx));
        causeTick();
    }
}

function causeTick(){
    let time = new Date().getTime();
    cog12.startTick(time);
    cog6.startTick(time);
    window.setTimeout(causeTick, 1300);
}

function draw(ctx: CanvasRenderingContext2D) {
    let time = new Date().getTime();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, 600, 500)
    cog12.draw(ctx, time);
    cog6.draw(ctx, time);
    window.requestAnimationFrame(draw.bind(this, ctx));
}

window.addEventListener("DOMContentLoaded", (event) => {
    init();
});