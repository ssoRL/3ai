class KudzuTutorial {
    // constants
    public readonly in_y = 200;
    public readonly step = (CANVAS_DEFINED_SIZE - 2*this.in_y)/4;
    public readonly click_gem_y = this.in_y + 1*this.step;
    public readonly conjunction_y = this.in_y + 2*this.step;
    public readonly cogs_y = this.in_y + 3*this.step;
    public readonly out_y = this.in_y + 4*this.step;

    private readonly typing_speed = 20;

    // objects
    private wire: Wire;
    private cog: Cog;
    private click_gem: Gem;
    private conjunction_gem: Gem;
    private cog_gem: Gem;
    private big_gem: Gem;

    // state
    is_initialized = false;
    is_started = false;


    constructor() {
        // create the cogs
        this.cog = new Cog(4150, 830, 12, SpinDirection.COUNTER_CLOCKWISE, Math.PI/12, 4500);
        const wired_cog = this.cog.addDrivenCog(6, 6);
        RunWire.addWireToCog(4501, ct(2), ct(4));

        // lay the initial wires
        this.wire = new Wire({x: 4200, y: 300}, {x: 4100, y: 300});
        const right_down_x: number = wired_cog.getCogTerminalPoint(ct(3)).x;
        const left_down_x = 3000 + (4000 - right_down_x);
        const wire_into_frame_from_right = this.wire.addStraightWireTo("horz", right_down_x);
    
        // Wires to first gem
        this.click_gem = new Gem(p(3500, this.click_gem_y), 25, {r:255, g:198, b:76}, true);
        wire_into_frame_from_right
            .addStraightWireTo("vert", this.in_y)
            .addStraightWireTo("horz", left_down_x)
            .addPoweredWiresToGemTerminal(this.click_gem.getTerminal("W"), "vert")

        // AND gate
        const conjunction = new AndGate(p(3333, this.conjunction_y), "W");
        // wires to its right terminal
        this.conjunction_gem = new Gem(p(3666, this.conjunction_y), 25, {r:255, g:171, b:76}, true);
        this.click_gem
            .getWireOut("E")
            .addStraightWireTo("horz", right_down_x - 50)
            .addPoweredWiresToGemTerminal(this.conjunction_gem.getTerminal("E"), "vert");
        this.conjunction_gem
            .getWireOut("W")
            .addStraightWireTo('horz', 3550)
            .addPoweredWiresToAndTerminal(conjunction.right_terminal, "vert");
        // wires to the left terminal
        const right_wire_half_down = wire_into_frame_from_right.addStraightWireTo("vert", this.conjunction_y + 50);
        right_wire_half_down
            .addStraightWireTo("horz", 3450)
            .addPoweredWiresToAndTerminal(conjunction.left_terminal, "vert");

        // wires to the cog gem
        this.cog_gem = new Gem(p(3500, this.cogs_y), 25, {r:255, g:103, b:76}, true);
        conjunction
            .getOutWire()
            .addStraightWireTo("horz", left_down_x)
            .addPoweredWiresToGemTerminal(this.cog_gem.getTerminal('W'), 'vert');

        // wire to cog
        right_wire_half_down.addPoweredWiresToCogTerminal(4501, "vert", ct(3));

        // wires to lower AND gate
        const lower_and_gate = new AndGate(p(3666, this.out_y), "W");
        // to the right side
        this.cog_gem
            .getWireOut("E")
            .addStraightWireTo("horz", right_down_x - 100)
            .addPoweredWiresToAndTerminal(lower_and_gate.right_terminal, "vert");
        // To the left side
        RunWire
            .awayFromCogTerminal(4501, 1)
            .addPoweredWiresToAndTerminal(lower_and_gate.left_terminal, "vert")

        // Final gem
        this.big_gem = new Gem(p(3333, this.out_y), 35, {r:255, g:76, b:76}, true);
        lower_and_gate
            .getOutWire()
            .addPoweredWiresToGemTerminal(this.big_gem.getTerminal("E"), "horz");

        // wire run back to the main screen
        this.big_gem
            .getWireOut("W")
            .addStraightWireTo("horz", 1025)
            .addStraightWireTo("vert", 25)
            .addStraightWireTo('horz', 1000);

        this.is_initialized = true;
    }

    public start() {
        if(this.is_started) {
            // don't allow restart
            return;
        } else {
            this.is_started = true;
        }

        this.wire.power(true, performance.now());

        this.click_gem.onclick = () => {
            this.click_gem.powerThru(performance.now());
            this.gemClicked();
            this.click_gem.onclick = () => {};
        }

        this.click_gem.onactivated = () => {
            const first_y = (this.in_y + this.click_gem_y)/2;
            const first_direction = new Word(
                "Nodes: Illuminated, invite interaction",
                p(3500, first_y), "", 30, "sans-serif", "center"
            );
            first_direction.addGhostTypist(this.typing_speed, 1);
            glb.kudzu_story_controller.words.push(first_direction);
        }
    }

    private gemClicked() {
        this.conjunction_gem.onclick = () => {
            this.conjunction_gem.powerThru(performance.now());
            this.conjunctionPowered();
            this.conjunction_gem.onclick = () => {};
        }

        this.conjunction_gem.onactivated = () => {
            const second_y = (this.click_gem_y + this.conjunction_y)/2;
            const second_direction = new Word(
                "Conjunctions: Powered pair prerequisite to pass",
                p(3500, second_y), "", 30, "sans-serif", "center"
            );
            second_direction.addGhostTypist(this.typing_speed, 1);
            glb.kudzu_story_controller.words.push(second_direction);
        }
    }

    private conjunctionPowered() {
        this.cog_gem.onclick = () => {
            this.cog_gem.powerThru(performance.now());
            this.cog.activate(true);
            this.tick();
            this.prepEnd();
            this.cog_gem.onclick = () => {};
        }

        this.cog_gem.onactivated = () => {
            const third_y = (this.conjunction_y + this.cogs_y)/2 + 20;
            const third_direction = new Word(
                "Gears: Correctly convolved, carry current",
                p(3500, third_y), "", 30, "sans-serif", "center"
            );
            third_direction.addGhostTypist(this.typing_speed, 1);
            glb.kudzu_story_controller.words.push(third_direction);
        }
    }

    private prepEnd() {
        this.big_gem.onclick = () => {
            new Popup(
                'popups/story-at.html',
                () => {
                    this.big_gem.powerThru(performance.now(), true);
                    glb.kudzu_story_controller.prep_end();
                }    
            )
        }

        this.big_gem.onactivated = () => {
            const last_y = (this.cogs_y + this.out_y)/2;
            const last_direction = new Word(
                "More: behind the brilliance",
                p(3500, last_y), "", 30, "sans-serif", "center"
            );
            last_direction.addGhostTypist(this.typing_speed, 1);
            glb.kudzu_story_controller.words.push(last_direction);
        }

    }

    private tick() {
        this.cog.startTick(performance.now());
        window.setTimeout(this.tick.bind(this), TICK_EVERY);
    }

    draw() {
        this.wire.draw();
        if(this.is_initialized) {
            glb.canvas_controller.setTransform();
            this.click_gem.draw();
            this.conjunction_gem.draw();
            this.cog_gem.draw();
            this.big_gem.draw();
        }
        if(this.cog){
            this.cog.draw();
        }
    }
}