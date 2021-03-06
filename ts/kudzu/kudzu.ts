class KudzuStoryController {
    private done = false;
    private title_written = false;
    private tutorial: KudzuTutorial;

    private kudzu_story: string[][];

    /** The time taken to shift from the main screen to the kudzu story screen */
    private static readonly SHIFT_TO_KUDZU_TIME = 1000;
    /** The horizontal transition to this story */
    private static readonly TRANSLATE = 3000;
    /** The speed at which text is filled in. Measures in ms per letter */
    private static readonly TYPING_SPEED = 100;

    public words: Word[] = [];
    // Words of the title that might change
    private the_a_word: Word;
    /** The index of the a word used right now */
    private current_a_word: number = 0;
    private the_i_word: Word;
    private current_i_word: number = 0;

    private a_words: string[] = [
        "Artificial",
	    "Analytic",
	    "Automated",
	    "Abstracted",
	    "Algorithmic",
    ]

    private i_words: string[] = [
        "Intelligence",
	    "Invasion",
        "Imperium",
        "Interlope",
	    "Insurrection",
    ]

    constructor() {
        this.tutorial = new KudzuTutorial;
    }

    public isDone() {
        return this.done;
    }

    public async start() {
        // Load up the story from its json file
        this.kudzu_story = await this.getStory();

        // Define the transition
        const kudzu_transition = `all ${KudzuStoryController.SHIFT_TO_KUDZU_TIME}ms`;

        // Get the elements
        const kudzu_badge = getDocumentElementById("kudzu");
        const orth_badge = getDocumentElementById("orth");
        const story_section = getDocumentElementById("kudzu-story-text");
        // Add the transition logic
        kudzu_badge.style.transition = kudzu_transition;
        orth_badge.style.transition = kudzu_transition;
        story_section.style.transition = kudzu_transition;
        // Apply the reposition commands
        kudzu_badge.classList.remove("story-done");
        kudzu_badge.classList.remove("big-card");
        kudzu_badge.classList.add("small-card");
        kudzu_badge.classList.add("repositioned");
        orth_badge.classList.add("sidelined");
        story_section.classList.remove("sidelined");
        await glb.canvas_controller.animateTranslate(
            KudzuStoryController.TRANSLATE, 0, KudzuStoryController.SHIFT_TO_KUDZU_TIME
        );

        // After the movement is complete, fill in the title if not already written
        if(!this.title_written) {
            const title_string = "Vines of Kudzu";
            const title = new Word(title_string, p(3215, 125), "", 100, "sans-serif");
            title.addGhostTypist(KudzuStoryController.TYPING_SPEED, 1);
            this.words.push(title);
            await new Promise((resolve) => {
                window.setTimeout(resolve, title_string.length * KudzuStoryController.TYPING_SPEED)
            });
            this.title_written = true;
        }

        await this.fillInStory(0);
    }

    /**
     * Prepares to return to the main screen
     */
    public async prep_end() {
        // Define the transition
        const kudzu_transition = `transition: all ${KudzuStoryController.SHIFT_TO_KUDZU_TIME}ms`;

        // Move the badges and canvas to be in position for the kudzu story
        // Get the elements
        const kudzu_badge = getDocumentElementById("kudzu");
        const orth_badge = getDocumentElementById("orth");
        const story_section = getDocumentElementById("kudzu-story-text");
        // Add the transition logic
        kudzu_badge.style.transition = kudzu_transition;
        orth_badge.style.transition = kudzu_transition;
        story_section.style.transition = kudzu_transition;
        // Reposition the elements
        kudzu_badge.classList.remove("repositioned");
        kudzu_badge.classList.remove("big-card");
        kudzu_badge.classList.add("small-card");
        kudzu_badge.classList.add("story-done");
        story_section.classList.add("sidelined");

        // set the cookie so that if the reader leaves and comes back
        Cookies.set(KUDZU_COOKIE_NAME, STORY_DONE, {sameSite: "Strict"});
        
        await glb.canvas_controller.animateTranslate(
            0, 0, KudzuStoryController.SHIFT_TO_KUDZU_TIME
        );

        this.end();
        orth_badge.classList.remove("sidelined");

        kudzu_badge.style.transition = TITLE_CARD_TRANSITION;
        orth_badge.style.transition = TITLE_CARD_TRANSITION;
    }

    /**
     * Sets the story as if read, either in this session or in a previous one
     * @param before_power a promise that must resolve before the main wires are powered
     */
    public end(){
        this.done = true;

        glb.kudzu_story_controller.setIWord(undefined, false);

        glb.wire0.power(true, performance.now());
    }

    /** The size of the gradient's inner radius */
    private static readonly GRADIENT_INNER_R = 1300;
    /** The size of the gradient's inner radius */
    private static readonly GRADIENT_OUTER_R = 2500;

    public draw() {
        glb.canvas_controller.setTransform();
        // If the story isn't started, hold the gradient in place as the frame "pans" to it
        // Afterwards, hold the gradient pinned to the top
        const center: Point = this.done ?
            {
                x: glb.canvas_controller.offset.x + CANVAS_DEFINED_SIZE/2,
                y: glb.canvas_controller.offset.y - CANVAS_DEFINED_SIZE/2
            } :
            {
                x: KudzuStoryController.TRANSLATE + CANVAS_DEFINED_SIZE/2,
                y: -CANVAS_DEFINED_SIZE/2
            };

        const gradient = glb.ctx.createRadialGradient(
            center.x, center.y, KudzuStoryController.GRADIENT_INNER_R, 
            center.x, center.y, KudzuStoryController.GRADIENT_OUTER_R
        );

        gradient.addColorStop(0, "darkGreen");
        gradient.addColorStop(1, "white");
        glb.ctx.fillStyle = gradient;
        glb.ctx.fillRect(glb.canvas_controller.offset.x, glb.canvas_controller.offset.y, 1000, 1000);

        // Draw a grid for dev stuff
        if(SHOW_HELP_GRAPHICS) {
            glb.ctx.strokeStyle = "lightBlue"
            // Get the offsets shifted to the nearest multiple of 100
            let off_x = Math.ceil(glb.canvas_controller.offset.x/100)*100;
            let off_y = Math.ceil(glb.canvas_controller.offset.y/100)*100;
            for(let i=0; i<1000; i+= 100) {
                glb.ctx.beginPath()
                glb.ctx.moveTo(0 + off_x, i + off_y);
                glb.ctx.lineTo(1000 + off_x, i + off_y);
                glb.ctx.moveTo(i + off_x, 0 + off_y);
                glb.ctx.lineTo(i + off_x, 1000 + off_y);
                glb.ctx.stroke();
            }
        }

        // draw the words on the main screen
        glb.ctx.fillStyle = this.getWireColor(0);
        for(const word of this.words) {
            word.draw();
        }
        this.the_a_word.draw();
        this.the_i_word.draw();

        this.tutorial.draw();
    }

    private async getStory() {
        const uri = 'story/kudzu.json'
        try{
            let content = await fetch(uri, {
                method: 'GET'
            });
            const json_content =  await content.json();
            return <string[][]>json_content
        } catch {
            throw `3AI Error: Could not load ${uri}`;
        }
    }

    public setAWord(i?: number, ghost_typist = true) {
        // how much to shift the current word by
        if(i === undefined) {
            const increment = Math.floor(Math.random()*(this.a_words.length-1)) + 1;
            this.current_a_word = (this.current_a_word + increment)%this.a_words.length;
        } else {
            this.current_a_word = i;
        }
        this.the_a_word = new Word(
            this.a_words[this.current_a_word],
            p(275, 235), "bold", 32,
            "monospace"
        );
        if(ghost_typist){
            this.the_a_word.addGhostTypist(25, 1);
        }
    }

    public setIWord(i?: number, ghost_typist = true) {
        if(i === undefined) {
            // how much to shift the current word by
            const increment = Math.floor(Math.random()*(this.i_words.length-1)) + 1;
            this.current_i_word = (this.current_i_word + increment)%this.i_words.length;
        } else {
            this.current_i_word = i;
        }
        this.the_i_word = new Word(
            this.i_words[this.current_i_word],
            p(305, 275), "bold", 36,
            "math"
        );
        if(ghost_typist) {
            this.the_i_word.addGhostTypist(25, 1);
        }
    }

    public getWireColor(x?: number): string | CanvasGradient {
        if(this.done) {
            return "olive"
        } else {
            if(x) {
                if(x > KudzuStoryController.TRANSLATE) {
                    return "olive";
                } else if (x < CANVAS_DEFINED_SIZE) {
                    return "black";
                }
            }
            const gradient = glb.ctx.createLinearGradient(
                CANVAS_DEFINED_SIZE, 0,
                KudzuStoryController.TRANSLATE, 0
            );
            gradient.addColorStop(0, "black");
            gradient.addColorStop(1, "olive");
            return gradient;
        }
    }

    public colorInOrbs(x: number): boolean {
        // Orbs are colored in if they are not on the main screen, or if the reader is thru kudzu
        return this.done || x > CANVAS_DEFINED_SIZE
    }

    private async fillInStory(current_section: number) {
        // get the story section and then clear out the previous text
        const story_section = getDocumentElementById("kudzu-story-text");
        if(!story_section) throw "3AI Error: There is no kudzu-story-text element";
        story_section.innerHTML = "";

        // Create the new element and add it to the DOM
        const section = this.kudzu_story[current_section];
        const html_story_section = document.createElement("div");
        html_story_section.classList.add("kudzu-story-section");
        // The first sections (the intro) should be centered, add a class
        if(current_section === 0) {
            html_story_section.classList.add("kudzu-intro");
        }
        story_section.appendChild(html_story_section);
        // Fill it with content
        for(const paragraph of section) {
            const html_story_paragraph = document.createElement("div");
            html_story_paragraph.classList.add("kudzu-story-paragraph");
            html_story_section.appendChild(html_story_paragraph);
            await this.fillInString(html_story_paragraph, paragraph, 60);
        }

        // Add the flexible center
        const flex_div = document.createElement("div");
        flex_div.classList.add('kudzu-flex');
        story_section.appendChild(flex_div);

        // Add a section to hold the buttons
        const button_section = document.createElement('div');
        button_section.classList.add('kudzu-buttons');
        story_section.appendChild(button_section);

        // Add the "Back" button if not the first page
        if(current_section > 0) {
            const back_button = document.createElement("a");
            back_button.classList.add("kudzu-button");
            back_button.innerText = "Back";
            back_button.onclick = () => {
                this.fillInStory(current_section - 1);
            }
            button_section.appendChild(back_button);
        }

        // Add a flexible center
        const flex_between_buttons = document.createElement("div");
        flex_between_buttons.classList.add('kudzu-flex');
        button_section.appendChild(flex_between_buttons);

        // Add the "Next" button
        const next_button = document.createElement("a");
        next_button.classList.add("kudzu-button");
        if(current_section + 1 >= this.kudzu_story.length) {
            next_button.innerText = "End";
            next_button.onclick = () => {
                this.end_of_story();
            }
        } else {
            next_button.innerText = "Next";
            next_button.onclick = () => {
                this.fillInStory(current_section + 1);
            }
        }
        button_section.appendChild(next_button);

        // Add the skip button
        if(KUDZU_SKIP_OPTION) {
            const skip_button = document.createElement("a");
            skip_button.classList.add('kudzu-skip');
            skip_button.innerText = "Skip to end";
            skip_button.onclick = () => {
                this.end_of_story();
            }
            story_section.appendChild(skip_button);
        }
    }

    /**
     * Adds a string to a DOM element in a random sequence
     * @param element 
     * @param content 
     */
    private async fillInString(element: HTMLElement, content: string, per: number): Promise<void> {
        // create a ghost typist to add to the string
        const ghost_typist = new GhostTypist(content, KudzuStoryController.TYPING_SPEED, per);

        // Return the promise that will resolve once filling in the string
        return new Promise((resolve) => {
            const fill = () => {
                if(!ghost_typist.isDone()) {
                    // not done, add the partial string
                    element.innerHTML = ghost_typist.getCurrentString();
                    // then set up a event for the next animation
                    window.requestAnimationFrame(fill);

                } else {
                    // done, add the full string and end this loop
                    element.innerHTML = ghost_typist.getCurrentString();
                    resolve();
                }
            }
            
            // start filling
            fill();
        });
    }

    private end_of_story() {
        this.done = true;

        const story_section = getDocumentElementById("kudzu-story-text");
        story_section.innerHTML = "";
        story_section.classList.add("sidelined");
        
        this.tutorial.start();
    }
}