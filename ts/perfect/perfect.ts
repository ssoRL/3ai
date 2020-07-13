class PerfectStoryController {
    // The DOM elements
    private badge: HTMLElement;
    private screen : HTMLElement;
    private story : HTMLElement;

    private static readonly TRANSITION_TIME = 2000;

    constructor() {
        this.badge = getDocumentElementById('perfect');
        this.screen = getDocumentElementById('perfect-screen');
    }

    private async initializeContent(): Promise<HTMLDivElement> {
        const story_text = await fetchContent('story/perfect.html');
        const story = document.createElement('div');
        story.id = "perfect-story";
        story.innerHTML = story_text;
        return story;
    }

    private async addGlow(
        step: number,
        of_steps: number,
        step_time: number,
        max_glow: number,
        gem: Gem
    ) {
        const glow = max_glow * step/of_steps;
        gem.addGlow(glow);
        if(step >= of_steps) {
            return; // base case
        } else {
            return new Promise((resolve) => {
                window.setTimeout(async () => {
                    await this.addGlow(step + 1, of_steps, step_time, max_glow, gem);
                    resolve();
                }, step_time);
            })
        }
    }

    public async start(gem: Gem) {
        const max_glow = 5000;
        const step_time = 50;
        const step_number = 30;
        this.addGlow(0, step_number, step_time, max_glow, gem);
        // transition the screen to totally white
        this.screen.classList.add("white-out");

        // wait a few seconds (1 more than the 3s transition time)
        await new Promise((resolve) => {
            window.setTimeout(resolve, 4000);
        });
        // Remove glow
        gem.addGlow(0);
        // Add the perfect title card
        this.badge.onclick = this.startStory.bind(this);
        this.badge.classList.remove('hide');
        await new Promise((resolve) => {
            this.screen.ontransitionend = resolve;
            this.screen.classList.remove("white-out");
        });
    }

    private async startStory() {
        // white out again
        await new Promise((resolve) => {
            this.screen.ontransitionend = resolve;
            this.screen.classList.add("white-out");
        });
        // create the story div
        this.story = await this.initializeContent();
        this.screen.appendChild(this.story);
    }
}