let cog12: Cog;
let wire0: Wire;

function init(){
    // Draw a bunch of cogs
    cog12 = new Cog(200, 200, 12, true, 0, 1000);
    let cog7 = cog12.addDrivenCog(1, 7);
    cog7.addDrivenCog(2, 5);

    // Draw some wires
    wire0 = new Wire({x: 490, y: 10}, {x: 400, y: 10});
    const wire1 = wire0.addChildWire("vert", 50);
    const ct1: CogTerminal = {
        cogSerialNumber: 1000,
        index: 10,
        isOuter: true
    }
    wire1.addChildToTerminal("horz", ct1)

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
    let rng = Math.random();
    if(rng < 0.5){
        wire0.powerUp();
    }else{
        wire0.powerDn();
    }
    window.setTimeout(causeTick, 1300);
}

function draw(ctx: CanvasRenderingContext2D) {
    let time = new Date().getTime();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, 1000, 1000)
    cog12.draw(ctx, time);
    wire0.draw(ctx, time);
    window.requestAnimationFrame(draw.bind(this, ctx));
}

window.addEventListener("DOMContentLoaded", (event) => {
    init();
});