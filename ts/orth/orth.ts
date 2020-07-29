/** The number of ticks it take to shift between the main and orth screen */
const TICKS_AT_START = 3;

class OrthStoryController {
    public done = false;
    /** A pair of cogs, one the reader will stop, the other they will start */
    private learn_stop_cog_tick_master: TickMaster;
    private drivers: {learn_stop_cog: Cog, learn_start_cog: Cog};
    /** A number between 0 and 1 that represents the fraction of the story passed */
    private scroll: number;

    /** The amount to translate the canvas down before starting the story  */
    static readonly TRANSLATE_DOWN = 1500;
    /** How much to shift the background as the story progresses */
    static readonly FURTHER_TRANSLATE_DOWN = 200;

    constructor(){
        this.drivers = init_cogs_orth();
        this.learn_stop_cog_tick_master = new TickMaster();
        this.learn_stop_cog_tick_master.addControlledCogs([this.drivers.learn_stop_cog]);
        const orth_badge = getDocumentElementById("orth");
        orth_badge.onclick = this.start.bind(this);
        this.initializeContent();
        // Define the gradient of the cog fill at the start
        const cog_fill_gradient = glb.ctx.createLinearGradient(0, 0, 0, 200);
        cog_fill_gradient.addColorStop(0, "silver");
        cog_fill_gradient.addColorStop(1, "white");
    }

    public async start() {
        // Move the badges and canvas to be in position for the kudzu story
        this.scroll = 0;
        const orth_badge = getDocumentElementById("orth");
        const kudzu_badge = getDocumentElementById("kudzu");
        const story_container = getDocumentElementById("orth-story-container");
        const continue_button = <HTMLButtonElement>getDocumentElementById("orth-down");
        const return_button = <HTMLButtonElement>getDocumentElementById("orth-up");
        const end_button = <HTMLButtonElement>getDocumentElementById("orth-end");
        // Add the css transition
        const transition_time = TICK_EVERY*(TICKS_AT_START - 1) + TICK_LENGTH + glb.tick_master.time_until_next_tick();
        const orth_transition = `all ${transition_time}ms cubic-bezier(1,0,.9,.85)`;
        kudzu_badge.style.transition = orth_transition;
        orth_badge.style.transition = orth_transition;
        story_container.style.transition = orth_transition;

        // and then execute the transitions
        kudzu_badge.classList.add("sidelined");
        orth_badge.classList.remove("story-done");
        orth_badge.classList.remove("big-card");
        orth_badge.classList.add("small-card");
        orth_badge.classList.add("repositioned");
        story_container.style.top = "10%";

        // Set the navigation button behaviors
        continue_button.onclick = (async () => {
            continue_button.disabled = true;
            await this.scrollStory('down');
            continue_button.disabled = false;
        });

        return_button.onclick = (async () => {
            return_button.disabled = true;
            await this.scrollStory('up');
            return_button.disabled = false;
        });

        end_button.onclick = () => {
            if(this.done) {
                // If the story was already read, just return immediately
                getDocumentElementById("orth-end").classList.add("sidelined");
                this.EndFromStory();
            } else {
                this.scrollStory('end');
            }
        }

        // Stop the global ticking and wait for the cog to stop
        glb.tick_master.stopUntilNextMissedTick().then(() => {
            // then, tick the cogs TICKS_AT_START more times
            glb.tick_master.start(TICKS_AT_START);
            this.learn_stop_cog_tick_master.start();
        });

        // Move the story into view
        const easer = glb.tick_easer
        await glb.canvas_controller.animateTranslate(
            0, OrthStoryController.TRANSLATE_DOWN, transition_time, easer.easeTickAnimation.bind(easer)
        );

        continue_button.classList.remove('sidelined');
        return_button.classList.remove('sidelined')


        // Set the transition on the story container to handle the shorter scroll transitions
        const scroll_transition_time = TICK_EVERY + TICK_LENGTH;
        const orth_scroll_transition = `all ${scroll_transition_time}ms ease-in`;
        story_container.style.transition = orth_scroll_transition;
        orth_badge.onclick = () => {};

        // Set up the instructions and the onClicks of the driver cogs
        // Activate the learn stop cog
        this.drivers.learn_stop_cog.activate(true);

        init_orth_words_stopping();

        // Add the actions that will happen when the cog is clicked
        this.drivers.learn_stop_cog.onClick = () => {
            init_orth_words_starting();
            this.drivers.learn_start_cog.activate(false);
            this.drivers.learn_stop_cog.onClick = () => {};
        }

        this.drivers.learn_start_cog.onClick = () => {
            this.EndFromStory();
        }
    }

    /**
     * The actions to take to prepare moving back to the main screen
     */
    private async EndFromStory() {
        const transition_time = TICK_EVERY*(TICKS_AT_START) + TICK_LENGTH;
        // cubic-bezier(1,0,.9,.85)
        const orth_transition = `all ${transition_time}ms cubic-bezier(.64,.4,1,.64)`;

        // Move the badges and canvas to be in position for the orth story
        const orth_badge = getDocumentElementById("orth");
        const kudzu_badge = getDocumentElementById("kudzu");
        const story_container = getDocumentElementById("orth-story-container");
        const up_button = getDocumentElementById("orth-up");
        // Add the css transition
        kudzu_badge.style.transition = orth_transition;
        orth_badge.style.transition = orth_transition;
        story_container.style.transition = orth_transition;
        // and then execute the transitions
        kudzu_badge.classList.remove("sidelined");
        story_container.style.top = "110%";
        orth_badge.classList.remove("repositioned");
        orth_badge.classList.remove("big-card");
        orth_badge.classList.add("small-card");
        orth_badge.classList.add("story-done");
        up_button.classList.add("sidelined");

        // Then execute the ending sequence
        Cookies.set(ORTH_COOKIE_NAME, STORY_DONE, {sameSite: "Strict"});
        this.end();

        await glb.canvas_controller.animateTranslate(
            0, 0, transition_time, glb.tick_easer.easeTickAnimation.bind(glb.tick_easer)
        );

        // then remove the custom transitions
        kudzu_badge.style.transition = TITLE_CARD_TRANSITION;
        orth_badge.style.transition = TITLE_CARD_TRANSITION;

        this.learn_stop_cog_tick_master.stop();

        // Make the story readable again
        orth_badge.onclick = this.start.bind(this);
    }

    /**
     * Sets everything like this story is done, either from the user reading in this session
     * or having a cookie marking orth as read previously
     */
    public async end() {
        // start everything ticking
        glb.tick_master.start();

        this.done = true;

        // activate all the cogs
        for(const cog of glb.driver_cogs) {
            cog.activate(true);
        }
    }

    private async initializeContent() {
        const story_text = await fetchContent('story/orth.html');
        getDocumentElementById("orth-story").innerHTML = story_text;
    }

    public draw() {
        this.learn_stop_cog_tick_master.checkTickStatus();
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

    private async scrollStory(to: 'up' | 'down' | 'end') {
        const main_container = getDocumentElementById("container");
        const story_container = getDocumentElementById("orth-story-container");

        const story_h = story_container.clientHeight;
        const main_h = main_container.clientHeight;
        // The percent to buffer the page by
        const buffer_pct = 0.1;

        const scroll_to = (() => {
            switch (to) {
                case 'end':
                    // if the user specifically asking to go to the end of the story
                    return { scroll: 1, no_more: true };
                case 'down':
                    // scroll the story down by 60% of the main height
                    const scroll_down_h = 0.6*main_h;
                    // Otherwise, move the page up a bit, but always fill the page
                    // max scroll is the number needed to leave only a buffer at the bottom
                    const max_scroll_down = 1 - (1-2*buffer_pct)*main_h/story_h;
                    const added_scroll_down = this.scroll + scroll_down_h/story_h;
                    return {
                        scroll: Math.min(added_scroll_down, max_scroll_down),
                        no_more: added_scroll_down >= max_scroll_down
                    };
                case 'up':
                    // scroll the story up by 50% of the main height
                    const scroll_up_h = 0.5*main_h;
                    return {
                        scroll: Math.max(this.scroll - scroll_up_h/story_h, 0),
                        no_more: false
                    };
            }
        })();

        // At the end remove the return button
        if(to === 'end') {
            getDocumentElementById("orth-up").classList.add("sidelined");
            getDocumentElementById("orth-end").classList.add("sidelined");
        }

        if(scroll_to.no_more) {
            // remove the continue button
            getDocumentElementById("orth-down").classList.add("sidelined");
        } else {
            getDocumentElementById("orth-end").classList.add("sidelined");
        }

        this.scroll = scroll_to.scroll;

        // The amount inn px needed to put the story in position
        const top_offset = -1*this.scroll*story_h;
        // Add a buffer to the top of the page
        const top_buffer = buffer_pct*main_h;

        // Calculate what position to move the background to
        let background_offset_y = OrthStoryController.TRANSLATE_DOWN + this.scroll*OrthStoryController.FURTHER_TRANSLATE_DOWN;

        // Then do the moving
        glb.tick_master.start(2);
        story_container.style.top = `${top_offset + top_buffer}px`
        await glb.canvas_controller.animateTranslate(
            0, background_offset_y, TICK_EVERY + TICK_LENGTH
        );

        if(to !== 'end'){
            // if the story hasn't been ended yet, make sure there's a button to interact with
            if(scroll_to.no_more) {
                getDocumentElementById("orth-end").classList.remove("sidelined");
            } else {
                getDocumentElementById("orth-down").classList.remove("sidelined");
            }
        }
    }
}