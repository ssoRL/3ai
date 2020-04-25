/** The time taken to shift from the main screen to the kudzu story screen */
const TICKS_AT_START = 4;

class OrthStoryController {
    private done = false;
    private in_progress = false;
    private driver_cogs: Cog[];
    /** A number between 0 and 1 that represents the fraction of the story passed */
    private scroll = 0;

    private readonly bw_cog_swatch: CogSwatch = {
        outer_outline: "black",
        inner_fill: "white",
        screw_outline: "black",
        screw_fill: "white",
        driver_going: "white",
        driver_stopped: "white"
    };

    private readonly color_cog_swatch: CogSwatch = {
        outer_outline: "slateGray",
        inner_fill: "silver",
        screw_outline: "slateGray",
        screw_fill: "silver",
        driver_going: "green",
        driver_stopped: "red"
    };

    constructor(){
        this.driver_cogs = init_cogs_orth();
        this.initializeContent();
        const orth_badge = getDocumentElementById("orth");
        orth_badge.onclick = this.start.bind(this);
    }

    public async start() {
        this.in_progress = true;

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
        await canvas_controller.animateTranslate(0, 1500, transition_time, tick_easer.easeTickAnimaiton.bind(tick_easer));

        // Set the transition on the story container to handle the shorter scroll transitions
        const scroll_transition_time = TICK_EVERY + TICK_LENGTH;
        const orth_scroll_transition = `all ${scroll_transition_time}ms ease-in-out`;
        story_container.style.transition = orth_scroll_transition;
        orth_badge.onclick = () => {};
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

    public draw(ctx: CanvasRenderingContext2D, time: number) {
        for(const cog of this.driver_cogs) {
            cog.draw(ctx, time, this.color_cog_swatch);
        }
    }

    public getCogSwatch() {
        if(this.done) {
            return this.color_cog_swatch;
        }else{
            return this.bw_cog_swatch;
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
        for(const cog of driver_cogs) {
            cog.startTick(time);
        }
        if(!this.done) {
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