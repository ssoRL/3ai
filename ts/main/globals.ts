/** A collection of all the global objects */
class ThreeAIGlobals {
    /** The root cogs that show up on the main page */
    public driver_cogs: Cog[];

    /** The root wire of the main page */
    public wire0: Wire;

    /** The object used to position the canvas */
    public readonly canvas_controller: CanvasController;

    /** Controls elements relating to the kudzu story */
    public kudzu_story_controller: KudzuStoryController;

    /** Controls elements related to the orthoganal machines story */
    public orth_story_controller: OrthStoryController;

    /** A class used to calculate the easing progress of the cogs on the ticks */
    public tick_easer: TickEaser;

    /** The canvas Context to draw on */
    public readonly ctx: CanvasRenderingContext2D;

    // And then the mutable values that will be used when drawing
    /** The current system time when the most recent draw started */
    public time: number;

    // Sets up the ctx and canvas controller
    constructor() {
        const canvas = <HTMLCanvasElement>document.getElementById('canvas');
        const canvas_container = <HTMLDivElement>document.getElementById('container');
        const context = canvas.getContext('2d');
        if(!context) throw "3AI Error: Could not get context";

        this.canvas_controller = new CanvasController(canvas, canvas_container);
        this.ctx = context;
    }
}