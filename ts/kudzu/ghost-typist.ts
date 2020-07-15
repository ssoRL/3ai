class GhostTypist {
    /** The full string that will be shown when done */
    private full_string: string;

    /** how fast the typing happens in ms/letter */
    private speed: number;

    /** The number of letters to add in an iteration */
    private letters_per_iteration: number

    /** the array of shuffled numbers */
    private shuffled_numbers: number[];

    /** The index of the shuffled list to add from next */
    private next_index = 0;

    /** The chars that have been added (or not if null) */
    private chars_added: (string | null)[];

    /** Whether the string is completed */
    private is_done = false;

    constructor(full_string: string, speed: number, letters_per_iteration: number) {
        this.full_string = full_string;
        this.speed = speed;
        this.letters_per_iteration = letters_per_iteration;

        // create the chars added array with all nulls to begin
        this.chars_added = new Array(this.full_string.length);
        this.chars_added.fill(null);

        // Get a list of all char indexes that aren't start/end of italic control sequences
        const sorted_char_indices = this.handleItalics(full_string);

        // then shuffle it 
        this.shuffled_numbers = this.shuffle(sorted_char_indices);

        // start the loop of adding letter
        this.addLetter();
    }

    public isDone() {
        return this.is_done;
    }

    public getCurrentString(): string {
        return this.chars_added.reduce<string>(this.addedCharListToString, "")
    }

    private handleItalics(content: string): number[] {
        // Define a list of ordered numbers
        // Eg if the string is of length three numbers = [0, 1, 2]
        const ordered_numbers: number[] = new Array(content.length);
        for (let i=0; i<ordered_numbers.length; i++) {
            ordered_numbers[i] = i;
        }

        // marks if currently in the midst of an italics sequence
        let unclosed_italics_sequence = false;
        // Go backwards so removing a "*" early on doesn't offset the index of later ones in ordered_numbers
        for(let i=content.length-1; i>=0; i--) {
            const char = content.charAt(i);
            if(char === "*") {
                // This is the start or end of an italicized sequence
                // This char should not be printed by the ghost typist, remove from list
                ordered_numbers.splice(i, 1);
                if(unclosed_italics_sequence) {
                    // It's the end
                    // Add a block end
                    this.chars_added[i] = `<span class="kudzu-italics">`;
                } else {
                    // It's the start
                    this.chars_added[i] = "</span>";
                }
                // flip the unended italics bit
                unclosed_italics_sequence = !unclosed_italics_sequence;
            }
        }

        if(unclosed_italics_sequence) {
            throw "3AI Error: Unended italics sequence."
        }

        return ordered_numbers;
    }

    /**
     * Starts a timed loop of adding chars
     */
    private addLetter() {
        let j = 0;
        while(j<this.letters_per_iteration && this.next_index < this.full_string.length){
            const i = this.shuffled_numbers[this.next_index]
            this.chars_added[i] = this.full_string.charAt(i);
            this.next_index++;
            j++;
        }
        if(this.next_index >= this.full_string.length) {
            this.is_done = true;
        } else {
            window.setTimeout(
                () => this.addLetter(),
                this.speed
            );
        }
    }



    /**
     * A reducer function to convert added_char list to a string
     * @param accumulator 
     * @param maybeChar 
     */
    private addedCharListToString(accumulator: string, maybeChar: (string | null)) {
        if(maybeChar !== null) {
            return accumulator + maybeChar;
            //return accumulator + 1;
        } else {
            return accumulator;
        }
    }

    /**
     * Shuffles an array
     * @param a The array to shuffle
     */
    private shuffle (a: any[]) {
        const shuffle_chance = 0.5;
        const l = a.length;
        for (let i = 0; i < l; i++) {
            // Randomly skip this index half the time
            if(Math.random() > shuffle_chance) {
                continue;
            } else {
                // j is some number between i and l - 1
                const shift = Math.min(Math.floor(Math.random() * (l - 1 - i)));
                const j = i + shift;
                // swap position of i and j
                const temp = a[i];
                a[i] = a[j];
                a[j] = temp;
            }
        }
        return a;
    }
}