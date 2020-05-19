let glb: ThreeAIGlobals;

function init(){
    // Set up the global object
    glb = new ThreeAIGlobals();
    glb.driver_cogs = init_cogs();
    glb.wire0 = init_wires();
    init_words();
    glb.kudzu_story_controller = new KudzuStoryController();
    glb.orth_story_controller = new OrthStoryController();
    glb.tick_easer = new TickEaser(1.15, 0.85);
    glb.time = performance.now();
    
    
    if(TICKING) glb.orth_story_controller.tick();
    window.requestAnimationFrame(draw.bind(this));

    // Set the actions on the READ badges
    const kudzu = getDocumentElementById("kudzu");
    kudzu.onclick = () => {glb.kudzu_story_controller.start()};
}

function draw() {
    glb.time = performance.now();
    glb.ctx.setTransform(1, 0, 0, 1, 0, 0);
    glb.ctx.clearRect(0, 0, 1000, 1000);
    glb.ctx.lineWidth = 3;
    // Draw a grid for dev stuff
    if(SHOW_HELP_GRAPICS) {
        glb.ctx.strokeStyle = "lightBlue"
        for(let i=100; i<1000; i+= 100) {
            glb.ctx.beginPath()
            glb.ctx.moveTo(0, i);
            glb.ctx.lineTo(1000, i);
            glb.ctx.moveTo(i, 0);
            glb.ctx.lineTo(i, 1000);
            glb.ctx.stroke();
        }
    }
    glb.kudzu_story_controller.draw();
    glb.orth_story_controller.draw();
    for(const cog of glb.driver_cogs){
        cog.draw();
    }
    glb.wire0.draw();
    const t = performance.now()
    // console.log(`t: ${glb.time},d: ${t - glb.time}`);
    window.requestAnimationFrame(draw.bind(this));
}

window.addEventListener("DOMContentLoaded", () => {
    init();
});