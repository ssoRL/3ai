/** The time taken to shift from the main screen to the kudzu story screen */
const TICKS_AT_START = 4;

class OrthStoryController {
    public done = false;
    /** A pair of cogs, one the reader will stop, the other they will start */
    private drivers: {learn_stop_cog: Cog, learn_start_cog: Cog};
    /** A number between 0 and 1 that represents the fraction of the story passed */
    private scroll = 0;
    // Things to control the glowing centers of the cogs
    /** The glow amount, between 0 and 1 */
    private glow = 0;
    /** The amount the the glow jitters by */
    private static readonly GLOW_JITTER = 0.05;
    /** How ofter the glow jitters in milliseconds */
    private static readonly JITTER_FREQ = 200;
    private static readonly STOP_COLOR = "255,8,0";
    private static readonly GO_COLOR = "102,255,0";

    /** The amount to translate the canvas down before starting the story  */
    static readonly TRANSLATE_DOWN = 1500;
    /** How much to shift the background as the story progresses */
    static readonly FURTHER_TRANSLATE_DOWN = 200;

    constructor(){
        this.drivers = init_cogs_orth();
        this.initializeContent();
        const orth_badge = getDocumentElementById("orth");
        orth_badge.onclick = this.start.bind(this);

        // Define the gradient of the cog fill at the start
        const cog_fill_gradient = glb.ctx.createLinearGradient(0, 0, 0, 200);
        cog_fill_gradient.addColorStop(0, "silver");
        cog_fill_gradient.addColorStop(1, "white");
    }

    public async start() {
        // Move the badges and canvas to be in position for the kudzu story
        const orth_badge = getDocumentElementById("orth");
        const kudzu_badge = getDocumentElementById("kudzu");
        const story_container = getDocumentElementById("orth-story-container");
        const next_button = <HTMLButtonElement>getDocumentElementById("orth-next");
        // Add the css transition
        const transition_time = TICK_EVERY*(TICKS_AT_START - 1) + TICK_LENGTH;
        const orth_transition = `all ${transition_time}ms ease-in`;
        kudzu_badge.style.transition = orth_transition;
        orth_badge.style.transition = orth_transition;
        story_container.style.transition = orth_transition;
        next_button.style.transition = orth_transition;
        // and then execute the transitions
        kudzu_badge?.classList.add("sidelined");
        orth_badge?.classList.add("repositioned");
        story_container.style.top = "10%";
        next_button.classList.add("repositioned");

        // Set the next button behavior
        next_button.onclick = (async () => {
            next_button.disabled = true;
            await this.scrollStory();
            next_button.disabled = false;
        })

        this.tick(TICKS_AT_START);
        this.tick_learn_stop();

        // Move the story into view
        const easer = glb.tick_easer
        await glb.canvas_controller.animateTranslate(
            0, OrthStoryController.TRANSLATE_DOWN, transition_time, easer.easeTickAnimation.bind(easer)
        );

        // Set the transition on the story container to handle the shorter scroll transitions
        const scroll_transition_time = TICK_EVERY + TICK_LENGTH;
        const orth_scroll_transition = `all ${scroll_transition_time}ms ease-in`;
        story_container.style.transition = orth_scroll_transition;
        orth_badge.onclick = () => {};

        // Set up the instructions and the onClicks of the driver cogs
        // Activate the learn stop cog
        this.drivers.learn_stop_cog.activate(true);

        init_orth_words();

        // Add the actions that will happen when the cog is clicked
        this.drivers.learn_stop_cog.onClick = () => {
            this.drivers.learn_start_cog.activate(false);
        }

        this.drivers.learn_start_cog.onClick = () => {
            this.end();
        }
    }

    /**
     * The actions to take when the story is finished and returning to main screen
     */
    private async end() {
        this.done = true;
        const transition_time = TICK_EVERY*(TICKS_AT_START - 1) + TICK_LENGTH;
        const orth_transition = `all ${transition_time}ms ease-in`;

        // activate all the cogs
        for(const cog of glb.driver_cogs) {
            cog.activate(true);
        }
        // start everything ticking, then wait a tick
        await this.tick();

        // Move the badges and canvas to be in position for the kudzu story
        const orth_badge = getDocumentElementById("orth");
        const kudzu_badge = getDocumentElementById("kudzu");
        const story_container = getDocumentElementById("orth-story-container");
        const next_button = <HTMLButtonElement>getDocumentElementById("orth-next");
        // Add the css transition
        kudzu_badge.style.transition = orth_transition;
        orth_badge.style.transition = orth_transition;
        story_container.style.transition = orth_transition;
        next_button.style.transition = orth_transition;
        // and then execute the transitions
        kudzu_badge.classList.remove("sidelined");
        story_container.style.top = "110%";
        orth_badge.classList.remove("repositioned");
        orth_badge.classList.add("story-done");
        next_button.classList.remove("repositioned");

        await glb.canvas_controller.animateTranslate(
            0, 0, transition_time, glb.tick_easer.easeTickAnimation.bind(glb.tick_easer)
        );
    }

    private async initializeContent() {
            try{
                let contentFetch = await fetch('story/orth.html', {
                    method: 'get'
                });
                let text = await contentFetch.text();
                getDocumentElementById("orth-story").innerHTML = text;
            } catch {
                throw "3AI Error: Could not load orth/orth-story.html";
            }
      }

    public draw() {
        this.drivers.learn_start_cog.draw();
        this.drivers.learn_stop_cog.draw();
    }

    // a gradient centered around this cog's center
    private getCogCenteredGradient(a: number): CanvasGradient {
        // The start, which is white, should be further from the center
        const start_p = getPoint(200, a);
        const end_p = getPoint(-50, a);

        const grad = glb.ctx.createLinearGradient(start_p.y, -start_p.x, end_p.y, -end_p.x);
        grad.addColorStop(0, "white");
        grad.addColorStop(1, "silver");
        return grad;
    }

    /**
     * Gets the gradient used to fill in the cog, rotated and transformed properly
     * @param y the y coordinate of cog center
     * @param a the current angle of rotation
     */
    public getCogSwatch(y: number, a: number): CogSwatch {
        // First figure out the gradient of the center light
        // TODO: do this
        const driver_light = "white";

        // Then figure out the gradients of the metal and lines
        const counter_rotate = -a;
        if(!this.done) {
            if(y < CANVAS_DEFINED_SIZE) {
                return {
                    metal: "white",
                    lines: "black"
                }
            } else if(y > OrthStoryController.TRANSLATE_DOWN) {
                return {
                    metal: this.getCogCenteredGradient(counter_rotate),
                    lines: "slateGray"
                }
            } else {
                // Make a gradient that extends from the CANVAS_DEFINED_SIZE line to TRANSLATE_DOWN
                const gradient_start_r = y - CANVAS_DEFINED_SIZE;
                const gradient_end_r = y - OrthStoryController.TRANSLATE_DOWN;
                // And make sure it's shifted to handle the rotation
                const start_p = getPoint(gradient_start_r, counter_rotate);
                const end_p = getPoint(gradient_end_r, counter_rotate);
    
                const metal_grad = glb.ctx.createLinearGradient(start_p.y, -start_p.x, end_p.y, -end_p.x);
                metal_grad.addColorStop(0, "white");
                metal_grad.addColorStop(1, "silver");

                const lines_grad = glb.ctx.createLinearGradient(start_p.y, -start_p.x, end_p.y, -end_p.x);
                lines_grad.addColorStop(0, "black");
                lines_grad.addColorStop(1, "slateGray");

                return {
                    metal: metal_grad,
                    lines: lines_grad
                }
            }
        } else {
            // always use cog centered once the story is over
                return {
                    metal: this.getCogCenteredGradient(counter_rotate),
                    lines: "slateGray"
                }
        }
    }

    /**
     * Starts the cogs ticking
     * @param n How many times to tick. By default will tick forever
     */
    public async tick(n = Number.POSITIVE_INFINITY) {
        // Base case
        if(n <= 0) return;
        let time = performance.now();
        let next_tick_promise = new Promise((resolve) => {
            window.setTimeout(
                () => {
                    this.tick(n-1);
                    resolve();
                },
                TICK_EVERY);
        })
        for(const cog of glb.driver_cogs) {
            cog.startTick(time);
        }
        this.drivers.learn_start_cog.startTick(time);

        await next_tick_promise;
    }

    /**
     * This controls the ticking of the cog that teaches the reader to stop cogs
     * It starts out ticking constantly from the start
     */
    private tick_learn_stop() {
        let time = performance.now();
        window.setTimeout(this.tick_learn_stop.bind(this), TICK_EVERY);
        this.drivers.learn_stop_cog.startTick(time);
    }

    private async scrollStory() {
        const main_container = getDocumentElementById("container");
        const story_container = getDocumentElementById("orth-story-container");

        const story_h = story_container.clientHeight;
        const main_h = main_container.clientHeight;

        // scroll the story down by 70% of the main height
        const scroll_h = 0.7*main_h;
        this.scroll = Math.min(1, this.scroll + scroll_h/story_h);

        // The amount inn px needed to put the story in position
        const top_offset = -1*this.scroll*story_h;
        // Add a 10% buffer to the top of the page
        const top_buffer = 0.1*main_h;

        // Calculate what position to move the background to
        let background_offset_y = OrthStoryController.TRANSLATE_DOWN + this.scroll*OrthStoryController.FURTHER_TRANSLATE_DOWN;

        // Then do the moving
        this.tick(2);
        story_container.style.top = `${top_offset + top_buffer}px`
        return glb.canvas_controller.animateTranslate(
            0, background_offset_y, TICK_EVERY + TICK_LENGTH
        );
    }
}