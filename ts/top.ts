let cog12: Cog;
let wire0: Wire;

function init(){
    // Draw a bunch of cogs
    cog12 = new Cog(200, 200, 5, true, 0, 1000);
    let cog7 = cog12.addDrivenCog(1, 7);
    cog7.addDrivenCog(2, 5);

    // Draw some wires
    wire0 = new Wire({x: 490, y: 10}, {x: 400, y: 10});
    const wire1 = wire0.addPoweredWire("vert", 50);
    const ct1: CogTerminal = {
        index: 4,
        isOuter: true
    }
    wire1.addPoweredWiresToTerminal(1000, "horz", ct1)

    const ct2: CogTerminal = {
        index: 1,
        isOuter: false
    };
    Cog.addWireToCog(1000, ct1, ct2);

    let canvas : HTMLCanvasElement | null = <HTMLCanvasElement>document.getElementById('canvas');
    let ctx = canvas.getContext('2d');
    if(ctx !== null){
        window.requestAnimationFrame(draw.bind(this, ctx));
        wire0.power(true);
        causeTick();
    }
}

function causeTick(){
    let time = new Date().getTime();
    cog12.startTick(time);
    // let rng = Math.random();
    // if(rng < 0.5){
    //     wire0.power(true);
    // }else{
    //     wire0.power(false);
    // }
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