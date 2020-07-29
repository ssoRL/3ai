let glb: ThreeAIGlobals;

/** Keeps track of the images loaded */
let kudzu_img_loaded = false;
let orth_img_loaded = false;
let styles_set = false;

function init(){
    // Set up the global object
    glb = new ThreeAIGlobals();
    const url_params = new URLSearchParams(window.location.search);
    HARD_MODE = url_params.get('hardMode') === "true";
    glb.driver_cogs = init_cogs();
    const wires_and_gems = init_wires();
    glb.wire0 = wires_and_gems.wire;
    glb.gems = wires_and_gems.gems;
    glb.kudzu_story_controller = new KudzuStoryController();
    glb.orth_story_controller = new OrthStoryController();
    glb.perfect_story_controller = new PerfectStoryController();
    init_words();
    glb.tick_easer = new TickEaser(1.15, 0.85);
    glb.time = performance.now();
    
    window.requestAnimationFrame(draw.bind(this));

    // Set the actions on the READ badges
    setupTitleCards();
    const kudzu = getDocumentElementById("kudzu");
    kudzu.onclick = () => {glb.kudzu_story_controller.start()};
}

/** Sets the starting size and transition rules of the "Read:" cards */
function setupTitleCards() {
    // Set up the transitions to happen instantly at the start
    const kudzu_badge = getDocumentElementById("kudzu");
    kudzu_badge.style.transition = "none";
    // Keep Progress
    if(Cookies.get(KUDZU_COOKIE_NAME) === STORY_DONE || HARD_MODE) {
        // Set the kudzu badge to be small
        kudzu_badge.classList.add('small-card');
        kudzu_badge.classList.add('story-done');
        glb.kudzu_story_controller.end();
    } else {
        kudzu_badge.classList.add('big-card')
    }
    // call offsetHeight to flush css transition change
    kudzu_badge.offsetHeight;
    kudzu_badge.style.transition = TITLE_CARD_TRANSITION;


    const orth_badge = getDocumentElementById("orth");
    orth_badge.style.transition = "none";
    if(Cookies.get(ORTH_COOKIE_NAME) === STORY_DONE || HARD_MODE) {
        // Set the kudzu badge to be small
        orth_badge.classList.add('small-card');
        orth_badge.classList.add('story-done');
        glb.orth_story_controller.end();
    } else {
        orth_badge.classList.add('big-card')
    }
    // call offsetHeight to flush css transition change
    orth_badge.offsetHeight;
    orth_badge.style.transition = TITLE_CARD_TRANSITION;

    // call imgLoaded styles set
    imgLoaded("styles_set");
}

function imgLoaded(img: "kudzu" | "orth" | "styles_set") {
    if(img === "kudzu") {
        // kudzu is loaded
        kudzu_img_loaded = true;
    } else if(img === "orth") {
        // orth is loaded
        orth_img_loaded = true;
    } else {
        styles_set = true;
    }

    // if both are loaded and styles are set, slide them in
    if (kudzu_img_loaded && orth_img_loaded && styles_set) {
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
    glb.canvas_controller.checkAnimationStatus();
    glb.tick_master.checkTickStatus();
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