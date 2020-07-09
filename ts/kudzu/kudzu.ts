class KudzuStoryController {
    private done = false;
    private tutorial: KudzuTutorial;

    private kudzu_story: string[][];

    /** The time taken to shift from the main screen to the kudzu story screen */
    private static readonly SHIFT_TO_KUDZU_TIME = 1000;
    /** The horizontal transition to this story */
    private static readonly TRANSLATE = 3000;
    /** The speed at which text is filled in. Measures in ms per letter */
    private static readonly TYPING_SPEED = 100;

    public words: Word[] = [];

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
        kudzu_badge.classList.add("repositioned");
        orth_badge.classList.add("sidelined");
        story_section.classList.remove("sidelined");
        await glb.canvas_controller.animateTranslate(
            KudzuStoryController.TRANSLATE, 0, KudzuStoryController.SHIFT_TO_KUDZU_TIME
        );

        // After the movement is complete, fill in the title
        const title_string = "Vines of Kudzu";
        const title = new Word(title_string, p(3215, 125), "", 100, "sans-serif");
        title.addGhostTypist(KudzuStoryController.TYPING_SPEED, 1);
        this.words.push(title);
        await new Promise((resolve) => {
            window.setTimeout(resolve, title_string.length * KudzuStoryController.TYPING_SPEED)
        });

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

        // set the cookie so that if the reader leaves and comes back
        Cookies.set(KUDZU_COOKIE_NAME, STORY_DONE, {sameSite: "Strict"});
        
        const transform_promise =  glb.canvas_controller.animateTranslate(
            0, 0, KudzuStoryController.SHIFT_TO_KUDZU_TIME
        );

        this.end(transform_promise);
    }

    /** called when the story was already completed in a previous session */
    public async quick_end() {
        // transitions should be instant in this case
        const kudzu_badge = getDocumentElementById("kudzu");
        kudzu_badge.style.transition = "none";
        this.end();
    }

    /**
     * Sets the story as if read, either in this session or in a previous one
     * @param before_power a promise that must resolve before the main wires are powered
     */
    private async end(before_power?: Promise<any>){
        this.done = true;

        // Get the elements
        const kudzu_badge = getDocumentElementById("kudzu");
        const orth_badge = getDocumentElementById("orth");
        const story_section = getDocumentElementById("kudzu-story-text");
        // Reposition the elements
        kudzu_badge.classList.remove("repositioned");
        kudzu_badge.classList.add("story-done");
        orth_badge.classList.remove("sidelined");
        story_section.classList.add("sidelined");

        if(before_power) {
            // if passed a promise, wait until it resolves to power up the wires
            await before_power;
        }

        glb.wire0.power(true);

        // Reset the badges' transition property so that they react right
        // call offsetHeight to flush css transition change
        kudzu_badge.offsetHeight;
        kudzu_badge.style.transition = '';
        orth_badge.style.transition = '';
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

    private async fillInStory(next_section: number) {
        // get the story section and then clear out the previous text
        const story_section = getDocumentElementById("kudzu-story-text");
        if(!story_section) throw "3AI Error: There is no kudzu-story-text element";
        story_section.innerHTML = "";

        // Create the new element and add it to the DOM
        const section = this.kudzu_story[next_section];
        const html_story_section = document.createElement("div");
        html_story_section.classList.add("kudzu-story-section");
        // The first sections (the intro) should be italic, add a class
        if(next_section === 0) {
            html_story_section.classList.add("kudzu-intro");
        }
        story_section.appendChild(html_story_section);
        // Fill it with content
        for(const paragraph of section) {
            const html_story_paragraph = document.createElement("div");
            html_story_paragraph.classList.add("kudzu-story-paragraph");
            html_story_section.appendChild(html_story_paragraph);
            await this.fillInString(html_story_paragraph, paragraph, 15);
        }

        // Add the flexible center
        const flex_div = document.createElement("div");
        flex_div.classList.add('kudzu-flex');
        story_section.appendChild(flex_div);

        // Add the "Next" button
        const next_button = document.createElement("a");
        next_button.classList.add("kudzu-next");
        next_button.innerText = "Next";
        if(next_section + 1 >= this.kudzu_story.length) {
            next_button.onclick = () => {
                this.end_of_story();
            }
        } else {
            next_button.onclick = () => {
                this.fillInStory(next_section + 1);
            }
        }
        story_section.appendChild(next_button);

        // Add the skip button
        const skip_button = document.createElement("a");
        skip_button.classList.add('kudzu-skip');
        skip_button.innerText = "Skip to end";
        skip_button.onclick = () => {
            this.end_of_story();
        }
        story_section.appendChild(skip_button);
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
                    element.innerText = ghost_typist.getCurrentString();
                    // then set up a event for the next animation
                    window.requestAnimationFrame(fill);

                } else {
                    // done, add the full string and end this loop
                    element.innerText = content;
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