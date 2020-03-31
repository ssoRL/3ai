let cog12: Cog;
let wire0: Wire;
let canvas_controller: CanvasController;

function init(){
    let canvas : HTMLCanvasElement | null = <HTMLCanvasElement>document.getElementById('canvas');
    canvas_controller = new CanvasController(canvas);
    
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
    wire1.addPoweredWiresToCogTerminal(1000, "horz", ct1)

    const ct2: CogTerminal = {
        index: 0,
        isOuter: true
    };
    Cog.addWireToCog(1000, ct1, ct2);

    Cog.addTerminalConnectionBetweenCogs(1000, 0);

    Cog.addWireToCog(1001, {index: 0, isOuter: false}, {index: 4, isOuter: true});

    const wire_away0 = Cog.leadWireAwayFromCogTerminal(1001, {index: 4, isOuter: true}, {x: 300, y: 400}, "vert");

    const and_gate = new AndGate(680, 420, "S");
    wire_away0.addPoweredWiresToAndTerminal(and_gate.right_terminal, "horz");
    wire1.addPoweredWiresToAndTerminal(and_gate.left_terminal, "horz");
    const and_away0 = and_gate.addPoweringWire();
    and_away0.addPoweredWire("vert", 30);

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

window.addEventListener("DOMContentLoaded", () => {
    init();
});