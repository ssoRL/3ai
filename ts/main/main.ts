let glb: ThreeAIGlobals;

/** Keeps track of the images loaded */
let kudzu_img_loaded = false;
let orth_img_loaded = false;

function init(){
    // Set up the global object
    glb = new ThreeAIGlobals();
    glb.driver_cogs = init_cogs();
    const wires_and_gems = init_wires();
    glb.wire0 = wires_and_gems.wire;
    glb.gems = wires_and_gems.gems;
    glb.kudzu_story_controller = new KudzuStoryController();
    glb.orth_story_controller = new OrthStoryController();
    glb.perfect_story_controller = new PerfectStoryController();
    // Keep Progress
    if(Cookies.get(KUDZU_COOKIE_NAME) === STORY_DONE) {
        glb.kudzu_story_controller.quick_end();
    }
    if(Cookies.get(ORTH_COOKIE_NAME) === STORY_DONE) {
        glb.orth_story_controller.quick_end();
    }
    init_words();
    glb.tick_easer = new TickEaser(1.15, 0.85);
    glb.time = performance.now();
    
    window.requestAnimationFrame(draw.bind(this));

    // Set the actions on the READ badges
    const kudzu = getDocumentElementById("kudzu");
    kudzu.onclick = () => {glb.kudzu_story_controller.start()};
}

function img_loaded(img: "kudzu" | "orth") {
    if(img === "kudzu") {
        // kudzu is loaded
        kudzu_img_loaded = true;
    } else {
        // orth is loaded
        orth_img_loaded = true;
    }

    // if both are loaded, slide them in
    if (kudzu_img_loaded && orth_img_loaded) {
        const kudzu_badge = getDocumentElementById("kudzu");
        const orth_badge = getDocumentElementById("orth");

        kudzu_badge.classList.remove("sidelined");
        orth_badge.classList.remove("sidelined");
    }
}

function draw() {
    glb.time = performance.now();
    glb.ctx.setTransform(1, 0, 0, 1, 0, 0);
    glb.ctx.clearRect(0, 0, 1000, 1000);
    glb.ctx.lineWidth = 3;
    if(TRIP_WIRE) {
        debugger;
    }
    glb.kudzu_story_controller.draw();
    glb.orth_story_controller.draw();
    for(const cog of glb.driver_cogs){
        cog.draw();
    }
    glb.wire0.draw();
    for(const gem of glb.gems) {
        gem.draw();
    }
    window.requestAnimationFrame(draw.bind(this));
}

async function fetchContent(uri: string): Promise<string> {
    try{
        let contentFetch = await fetch(uri, {
            method: 'get'
        });
        return await contentFetch.text();
    } catch {
        throw `3AI Error: Could not load ${uri}`;
    }
}

window.addEventListener("DOMContentLoaded", () => {
    init();
});