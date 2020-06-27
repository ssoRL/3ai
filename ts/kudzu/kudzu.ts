class KudzuStoryController {
    private done = false;
    private wire0: Wire;
    private kudzu_gem: Gem;

    private kudzu_story: string[][];

    /** The time taken to shift from the main screen to the kudzu story screen */
    private static readonly SHIFT_TO_KUDZU_TIME = 1000;
    /** The horizontal transition to this story */
    private static readonly TRANSLATE = 3000;
    /** The speed at which text is filled in. Measures in ms per letter */
    private static readonly TYPING_SPEED = 1;

    public words: Word[] = [];

    constructor() {
        [this.wire0, this.kudzu_gem] = init_kudzu_wires();
        this.kudzu_gem.onclick = () => {
            this.prep_end();
        }
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
        const head_title = getDocumentElementById("kudzu-title-text");
        if(!head_title) throw "3AI Error: There is no kudzu-title-text element";
        await this.fillInString(head_title, "Vines of Kudzu");

        await this.fillInStory(0);
    }

    /**
     * Prepares to return to the main screen
     */
    private async prep_end() {
        // Define the transition
        const kudzu_transition = `transition: all ${KudzuStoryController.SHIFT_TO_KUDZU_TIME}ms`;

        // Move the badges and canvas to be in position for the kudzu story
        // Get the elements
        const kudzu_badge = getDocumentElementById("kudzu");
        const orth_badge = getDocumentElementById("orth");
        const head_title = getDocumentElementById("kudzu-title-text");
        const story_section = getDocumentElementById("kudzu-story-text");
        // Add the transition logic
        kudzu_badge.style.transition = kudzu_transition;
        orth_badge.style.transition = kudzu_transition;
        story_section.style.transition = kudzu_transition;
        head_title.style.transition = kudzu_transition;

        // set the cookie so that if the reader leaves and comes back
        Cookies.set(KUDZU_COOKIE_NAME, STORY_DONE, {sameSite: "Strict"});
        
        const transform_promise =  glb.canvas_controller.animateTranslate(
            0, 0, KudzuStoryController.SHIFT_TO_KUDZU_TIME
        );

        this.end(transform_promise);
    }

    /**
     * Sets the story as if read, either in this session or in a previous one
     * @param before_power a promise that must resolve before the main wires are powered
     */
    public async end(before_power?: Promise<any>){
        this.done = true;

        // Get the elements
        const kudzu_badge = getDocumentElementById("kudzu");
        const orth_badge = getDocumentElementById("orth");
        const head_title = getDocumentElementById("kudzu-title-text");
        const story_section = getDocumentElementById("kudzu-story-text");
        // Reposition the elements
        kudzu_badge?.classList.remove("repositioned");
        kudzu_badge?.classList.add("story-done");
        orth_badge?.classList.remove("sidelined");
        head_title?.classList.add("story-done");
        story_section?.classList.add("sidelined");

        if(before_power) {
            // if passed a promise, wait until it resolves to power up the wires
            await before_power;
        }

        glb.wire0.power(true);
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

        this.wire0.draw();
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

    /**
     * Shuffles an array, but biased towards shuffling the end over the start
     * @param a The array to shuffle
     */
    private partialShuffle (a: any[], shuffle_chance: number, max_shift: number) {
        const l = a.length;
        for (let i = 0; i < l; i++) {
            // Randomly skip this index shuffle_chance of the time
            if(Math.random() > shuffle_chance) {
                continue;
            } else {
                // j is some number between i and l - 1
                const shift = Math.min(Math.floor(Math.random() * (l - 1 - i)), max_shift);
                const j = i + shift;
                // swap position of i and j
                const temp = a[i];
                a[i] = a[j];
                a[j] = temp;
            }
        }
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
            await this.fillInString(html_story_paragraph, paragraph);
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
    private async fillInString(element: HTMLElement, content: string): Promise<void> {
        // This is an array that holds the characters that have been "typed"
        const chars_added: (string | null)[] = new Array(content.length);
        chars_added.fill(null);
        // A reducer function that converts the chars added array into a string
        const toStringReducer = (accumulator: string, char: (string | null)) => {
            if(char !== null) {
                return accumulator + char;
                //return accumulator + 1;
            } else {
                return accumulator;
            }
        }

        // Define a list of ordered numbers
        // Eg if the string is of length three numbers = [0, 1, 2]
        const numbers: number[] = new Array(content.length);
        for (let i=0; i<numbers.length; i++) {
            numbers[i] = i;
        }
        // then shuffle it 
        this.partialShuffle(numbers, 0.5, 6);

        const addChar = (index: number, resolve: () => void) => {
            // Get the next number from the shuffled list of numbers, add it to the list
            const char_index = numbers[index];
            const add_char = content.charAt(char_index);
            chars_added[char_index] = add_char;
            element.innerText = chars_added.reduce<string>(toStringReducer, "");
            window.setTimeout(
                () => {
                    const next_index = index + 1;
                    if(next_index < content.length) {
                        addChar(next_index, resolve);
                    } else {
                        // No more chars to add, resolve
                        resolve();
                    }
                },
                KudzuStoryController.TYPING_SPEED
            );
        }

        // Return the promise that will resolve once filling in the string
        return new Promise((resolve) => {
            addChar(0, resolve);
        });
    }

    private end_of_story() {
        this.done = true;
        this.wire0.power(true);

        const story_section = getDocumentElementById("kudzu-story-text");
        if(!story_section) throw "3AI Error: There is no kudzu-story-text element";
        story_section.innerHTML = "";

        const html_story_section = document.createElement("div");
        html_story_section.classList.add("kudzu-story-section");
        story_section.appendChild(html_story_section);

        const html_final_message_div = document.createElement("div");
        html_final_message_div.classList.add("kudzu-story-paragraph");
        html_story_section.appendChild(html_final_message_div);

        this.fillInString(html_final_message_div, `You have completed "Vines of Kudzu". Wires will now be powered. Click on glowing terminal to return to the main page.`)
    }
}