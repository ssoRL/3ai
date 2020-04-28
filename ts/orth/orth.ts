/** The time taken to shift from the main screen to the kudzu story screen */
const TICKS_AT_START = 4;

class OrthStoryController {
    private state: StoryState = StoryState.NOT_STARTED;
    private driver_cogs: Cog[];
    /** A number between 0 and 1 that represents the fraction of the story passed */
    private scroll = 0;

    /** The amount to translate the canvas down before starting the story  */
    static readonly TRANSLATE_DOWN = 1500;

    constructor(){
        this.driver_cogs = init_cogs_orth();
        this.initializeContent();
        const orth_badge = getDocumentElementById("orth");
        orth_badge.onclick = this.start.bind(this);

        // Define the gradient of the cog fill at the start
        const cog_fill_gradient = glb.ctx.createLinearGradient(0, 0, 0, 200);
        cog_fill_gradient.addColorStop(0, "silver");
        cog_fill_gradient.addColorStop(1, "white");
    }

    public async start() {
        this.state = StoryState.TRANSITION_IN;

        // Move the badges and canvas to be in position for the kudzu story
        const orth_badge = getDocumentElementById("orth");
        const orth_title = getDocumentElementById("orth-title-section");
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
        orth_title?.classList.add("no-height");
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

        // Move the story into view
        const easer = glb.tick_easer
        await glb.canvas_controller.animateTranslate(
            0, OrthStoryController.TRANSLATE_DOWN, transition_time, easer.easeTickAnimaiton.bind(easer)
        );

        // Set the transition on the story container to handle the shorter scroll transitions
        const scroll_transition_time = TICK_EVERY + TICK_LENGTH;
        const orth_scroll_transition = `all ${scroll_transition_time}ms ease-in-out`;
        story_container.style.transition = orth_scroll_transition;
        orth_badge.onclick = () => {};

        this.state = StoryState.IN_STORY;
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
        for(const cog of this.driver_cogs) {
            cog.draw();
        }
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
     * @param y the y coord of cog center
     * @param a the current angle of rotation
     */
    public getCogSwatch(y: number, a: number): CogSwatch {
        // First figure out the gradient of the center light
        // TODO: do this
        const driver_light = "white";

        // Then figure out the gradients of the metal and lines
        const counter_rotate = -a;
        if(
            this.state === StoryState.NOT_STARTED || 
            this.state === StoryState.TRANSITION_IN || 
            this.state === StoryState.IN_STORY
        ) {
            if(y < CANVAS_CANNONICAL_SIZE) {
                return {
                    metal: "white",
                    lines: "black",
                    driver_light: driver_light
                }
            } else if(y > OrthStoryController.TRANSLATE_DOWN) {
                return {
                    metal: this.getCogCenteredGradient(counter_rotate),
                    lines: "slateGray",
                    driver_light: driver_light
                }
            } else {
                // Make a gradient that extends from the CANVAS_CANNONICAL_SIZE line to TRANSLATE_DOWN
                const gradient_start_r = y - CANVAS_CANNONICAL_SIZE;
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
                    lines: lines_grad,
                    driver_light: driver_light
                }
            }
        } else {
            // always use cog centered once the story is over
                return {
                    metal: this.getCogCenteredGradient(counter_rotate),
                    lines: "slateGray",
                    driver_light: driver_light
                }
        }
    }

    /**
     * Starts the cogs ticking
     * @param n How many times to tick. By default will tick forever
     */
    public tick(n = Number.POSITIVE_INFINITY) {
        // Base case
        if(n <= 0) return;
        let time = performance.now();
        window.setTimeout(this.tick.bind(this, n-1), TICK_EVERY);
        for(const cog of glb.driver_cogs) {
            cog.startTick(time);
        }
        if(this.state !== StoryState.DONE) {
            for(const cog of this.driver_cogs) {
                cog.startTick(time);
            }
        }
    }

    private async scrollStory(hold_position = false) {
        const main_container = getDocumentElementById("container");
        const story_container = getDocumentElementById("orth-story-container");

        const story_h = story_container.clientHeight;
        const main_h = main_container.clientHeight;

        if(!hold_position) {
            // scroll the story down by 80% of the main height
            const scroll_h = 0.7*main_h;
            this.scroll = Math.min(1, this.scroll + scroll_h/story_h);
            // Start ticking the cogs
            this.tick(2);
        }

        // The amount needed to put the story in position
        const top_offset = -1*this.scroll*story_h;
        // The amount needed to add a buffer of 10% that shifts from the top to the bottom
        // as the user scrolls
        const top_buffer = (0.1 - 0.2*this.scroll)*main_h;
        story_container.style.top = `${top_offset + top_buffer}px`
        return new Promise((resolve) => {
            story_container.ontransitionend = resolve;
        })
        
    }
}