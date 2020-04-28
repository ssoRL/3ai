class KudzuStoryController {
    private done = false;
    private wire0: Wire;

    /** The time taken to shift from the main screen to the kudzu story screen */
    private static readonly SHIFT_TO_KUDZU_TIME = 1000;
    /** The horizontal transition to this story */
    private static readonly TRANSLATE = 3000;
    /** The speed at which text is filled in. Measures in ms per letter */
    private static readonly TYPING_SPEED = 15;
    /** The number of letters that fits in a standard 1x1 area */
    private static readonly LETTERS_PER_PIXEL = 0.008;

    constructor() {
        this.wire0 = init_kudzu_wires();
    }

    public async start() {
        // Move the badges and canvas to be in position for the kudzu story
        const kudzu_badge = document.getElementById("kudzu");
        const kudzu_title = document.getElementById("kudzu-title-section");
        const orth_badge = document.getElementById("orth");
        kudzu_badge?.classList.add("kudzu-transition");
        kudzu_badge?.classList.add("repositioned");
        kudzu_title?.classList.add("no-height");
        orth_badge?.classList.add("kudzu-transition");
        orth_badge?.classList.add("sidelined");
        await glb.canvas_controller.animateTranslate(
            KudzuStoryController.TRANSLATE, 0, KudzuStoryController.SHIFT_TO_KUDZU_TIME
        );

        // After the movenment is complete, fill in the title
        const head_title = document.getElementById("kudzu-title-text");
        if(!head_title) throw "3AI Error: There is no kudzu-title-text eleement";
        await this.fillInString(head_title, "Vines of Kudzu");

        const next_section = await this.fillInStory(0);
        console.log(`The next section will be ${next_section}`);
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
                x: KudzuStoryController.TRANSLATE + CANVAS_CANNONICAL_SIZE/2,
                y: -CANVAS_CANNONICAL_SIZE/2
            } :
            {
                x: glb.canvas_controller.offset.x + CANVAS_CANNONICAL_SIZE/2,
                y: glb.canvas_controller.offset.y - CANVAS_CANNONICAL_SIZE/2
            };

        const gradient = glb.ctx.createRadialGradient(
            center.x, center.y, KudzuStoryController.GRADIENT_INNER_R, 
            center.x, center.y, KudzuStoryController.GRADIENT_OUTER_R
        );

        gradient.addColorStop(0, "darkgreen");
        gradient.addColorStop(1, "white");
        glb.ctx.fillStyle = gradient;
        glb.ctx.fillRect(1000, 0, 3000, 1000);
        this.wire0.draw();
    }

    public getWireColor(): string| CanvasGradient{
        if(this.done) {
            return "olive"
        } else {
            const gradient = glb.ctx.createLinearGradient(
                CANVAS_CANNONICAL_SIZE, 0,
                KudzuStoryController.TRANSLATE, 0
            );
            gradient.addColorStop(0, "black");
            gradient.addColorStop(1, "olive");
            return gradient;
        }
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

    private async fillInStory(from_section: number): Promise<number> {
        // get the story section and then clear out the previous text
        const story_section = document.getElementById("kudzu-story-text");
        if(!story_section) throw "3AI Error: There is no kudzu-story-text eleement";
        story_section.innerHTML = "";

        const capacity = KudzuStoryController.LETTERS_PER_PIXEL * story_section.clientHeight * story_section.clientWidth;
        // figure our how many sections can fit this cycle
        let to_section = from_section;
        let total_contents_length = 0;
        while(to_section < kudzu_story.length) {
            // calculate the number of characters in this section
            const section = kudzu_story[to_section];
            const section_length = section.paragraphs.reduce<number>(
                (acc, cur) => acc + cur.length,
                0
            )
            total_contents_length += section_length;
            // Check if this content will overflow the window, break if so
            // Ignore this for the to_section, since at least one thing MUST be written
            if(total_contents_length > capacity && to_section !== from_section) {
                break
            }
            // compensate for bigger section breaks
            total_contents_length += story_section.clientWidth;

            // Create the new element and add it to the DOM
            const html_story_section = document.createElement("div");
            html_story_section.classList.add("kudzu-story-section");
            if(section.classes) {
                for(const section_class of section.classes) {
                    html_story_section.classList.add(section_class);
                }
            }
            story_section.appendChild(html_story_section);
            // Fill it with content
            const string_fill_promises: Promise<void>[] = [];
            for(const paragraph of section.paragraphs) {
                const html_story_paragraph = document.createElement("div");
                html_story_paragraph.classList.add("kudzu-story-paragraph");
                html_story_section.appendChild(html_story_paragraph);
                string_fill_promises.push(this.fillInString(html_story_paragraph, paragraph));
            }
            await Promise.all(string_fill_promises);
            to_section++;
        }

        // finally, add the "Next" button
        const next_button = document.createElement("a");
        next_button.classList.add("kudzu-next");
        next_button.innerText = "Next";
        next_button.onclick = () => {
            this.fillInStory(to_section);
        }
        story_section.appendChild(next_button);

        return to_section;
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
}