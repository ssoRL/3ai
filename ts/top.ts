let cog12: Cog;
let wire0: Wire;

function init(){
    // Draw a bunch of cogs
    cog12 = new Cog(200, 200, 6, SpinDirection.CLOCKWISE, 0, 1000);
    let cog6 = cog12.addDrivenCog(0, 6);
    cog6.addDrivenCog(2, 5);
    cog12.addDrivenCog(4, 8);

    // Draw some wires
    wire0 = new Wire({x: 490, y: 10}, {x: 400, y: 10});
    const wire1 = wire0.addPoweredWire("vert", 40);
    const ct1: CogTerminal = {
        index: 5,
        isOuter: true
    }
    wire1.addPoweredWiresToTerminal(1000, "horz", ct1)
    const wire2 = wire1.addPoweredWire("horz", 300).addPoweredWire("vert", 370);

    const ct2: CogTerminal = {
        index: 0,
        isOuter: true
    };
    Cog.addWireToCog(1000, ct1, ct2);

    Cog.addTerminalConnectionBetweenCogs(1000, 0);

    Cog.addWireToCog(1001, {index: 0, isOuter: false}, {index: 4, isOuter: true});

    const wire_away0 = Cog.leadWireAwayFromCogTerminal(1001, {index: 4, isOuter: true}, {x: 680, y: 400}, "vert");
    const wire_away1 = wire_away0.addPoweredWire("vert", 20);

    const and_gate = new AndGate(680, 420);
    wire_away1.addPoweredConductor(and_gate.left_terminal);
    wire2.addPoweredConductor(and_gate.right_terminal);

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
    window.setTimeout(causeTick, 3000);
}

function draw(ctx: CanvasRenderingContext2D) {
    let time = new Date().getTime();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, 1000, 1000);
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
    cog12.draw(ctx, time);
    wire0.draw(ctx, time);
    window.requestAnimationFrame(draw.bind(this, ctx));
}

window.addEventListener("DOMContentLoaded", (event) => {
    init();
});