/** The time taken to shift from the main screen to the kudzu story screen */
const SHIFT_TO_ORTH_TIME = 700;

class OrthStoryController {
    private done = false;
    private in_progress = false;
    private driver_cogs: Cog[];
    /** A number between 0 and 1 that represents the fraction of the story passed */
    private scroll = 0;

    constructor(){
        this.driver_cogs = init_cogs_orth();
        this.initializeContent();
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
        const orth_transition = `all ${SHIFT_TO_ORTH_TIME}ms`;
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

        // tick all of the cogs once
        const now = performance.now();
        for(const cog of driver_cogs) {
            cog.startTick(now);
        }
        for(const cog of this.driver_cogs) {
            cog.startTick(now);
        }

        // Move the story into view
        await canvas_controller.animateTranslate(0, 1000, SHIFT_TO_ORTH_TIME);
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
            cog.draw(ctx, time);
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

    private async scrollStory(hold_position = false) {
        const main_container = getDocumentElementById("container");
        const story_container = getDocumentElementById("orth-story-container");

        const story_h = story_container.clientHeight;
        const main_h = main_container.clientHeight;

        if(!hold_position) {
            // scroll the story down by 80% of the main height
            const scroll_h = 0.8*main_h;
            this.scroll = Math.min(1, this.scroll + scroll_h/story_h);
            // Start ticking the cogs
            const now = performance.now();
            for(const cog of this.driver_cogs) {
                cog.startTick(now);
            }
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

    private async fillInStory(from_section: number): Promise<number> {
        // get the story section and then clear out the previous text
        const story_section = document.getElementById("kudzu-story-text");
        if(!story_section) throw "3AI Error: There is no kudzu-story-text eleement";
        story_section.innerHTML = "";

        const capacity = LETTERS_PER_PIXEL * story_section.clientHeight * story_section.clientWidth;
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
                TYPING_SPEED
            );
        }

        // Return the promise that will resolve once filling in the string
        return new Promise((resolve) => {
            addChar(0, resolve);
        });
    }
}