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

        // Define a list of ordered numbers
        // Eg if the string is of length three numbers = [0, 1, 2]
        this.shuffled_numbers = new Array(this.full_string.length);
        for (let i=0; i<this.shuffled_numbers.length; i++) {
            this.shuffled_numbers[i] = i;
        }
        // then shuffle it 
        this.partialShuffle(this.shuffled_numbers, 0.5, 20);

        // start the loop of adding letter
        this.addLetter();
    }

    public isDone() {
        return this.is_done;
    }

    public getCurrentString(): string {
        return this.chars_added.reduce<string>(this.addedCharListToString, "")
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
}