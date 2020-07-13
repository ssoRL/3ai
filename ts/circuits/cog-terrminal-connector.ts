class CogTerminalPair {
    public cog: Cog;
    public terminal: CogTerminal;

    constructor(cog:Cog, terminal: CogTerminal) {
        this.cog = cog;
        this.terminal = terminal;
    }
}
type PowerSource = CogTerminalPair | Wire;

function ctp(cog: Cog, terminal: CogTerminal): CogTerminalPair {
    return new CogTerminalPair(cog, terminal);
}

class CogTerminalConnector implements Conductor {
    is_on = false;
    private p: Point;
    /** The wire or cog that power comes from */
    private in_power: PowerSource;
    /** The wire that it goes to */
    private out_power: PowerSource;

    /** Whether the connection is made with the input */
    private in_connected: boolean;
    /** Whether the connection is made with the output */
    private out_connected: boolean;

    constructor(in_power_: PowerSource, out_power_: PowerSource) {
        this.in_power = in_power_;
        this.out_power = out_power_;

        if(this.in_power instanceof Wire) {
            if(this.out_power instanceof Wire) {
                throw "3AI Error: terminal should NOT be between two wires";
            }
            this.p = this.out_power.cog.getCogTerminalPoint(this.out_power.terminal);
        } else {
            this.p = this.in_power.cog.getCogTerminalPoint(this.in_power.terminal);
        }

        // Add this cog terminal connection to the etched wire's list if there is one
        if(this.in_power instanceof Wire) {
            this.in_power.addTerminalConnectionToChildren(this);
        } else {
            this.in_power.cog.etched_wire?.out_terminals.push(this);
        }

        // add to the incoming for etched wires this terminals powers
        if(this.out_power instanceof CogTerminalPair) {
            this.out_power.cog.in_terminals.push(this);
        }
    }

    isConnected(source: PowerSource): boolean {
        if(source instanceof Wire){
            return true;
        }
        // Check if the cog is in position for this terminal to hit a wire
        const cog_wire = source.cog.etched_wire;
        if(!cog_wire){
            return false;
        }
        return cog_wire.isConnectedWith(source.terminal);
    }

    private sendPowerIfConnected(switch_time: number){
        if(this.in_connected && this.out_connected){
            if(this.out_power instanceof Wire) {
                this.out_power.power(this.is_on, switch_time);
            } else {
                const cog_wire = this.out_power.cog.etched_wire;
                cog_wire?.power(this.is_on, this.out_power.terminal, switch_time);
            }
        }
    }

    public power(on: boolean, switch_time: number): void {
        this.in_connected = this.isConnected(this.in_power);
        this.out_connected = this.isConnected(this.out_power);
        this.is_on = on;
        this.sendPowerIfConnected(switch_time);
    }

    /** Actions to take when the underlying cog starts a tick */
    startTick(start_tick_time: number): void {
        // Break all connections when a tick starts
        this.in_connected = false;
        this.out_connected = false;
        this.is_on = false;

        // if output is a wire, turn it off
        if(this.out_power instanceof Wire) {
            this.out_power.power(false, start_tick_time);
        }
    }
    
    endTick(end_tick_time: number): void {
        // Trigger a power call here to check connections and send power if warranted
        this.power(this.is_on, end_tick_time);
    }
    
    draw(): void {
        if(SHOW_HELP_GRAPHICS) {
            // Only mark terminal locations with the dev flag on
            glb.canvas_controller.setTransform();
            // Draw a red circle if on
            if(this.is_on){
                glb.ctx.strokeStyle = "red";
                glb.ctx.beginPath();
                glb.ctx.moveTo(this.p.x + 5, this.p.y);
                glb.ctx.arc(this.p.x, this.p.y, 5, 0, 2*Math.PI);
                glb.ctx.stroke();
            }
            // Change the color of the smaller inner circle for connect info
            if(this.in_connected) {
                if(this.out_connected){
                    // orange for both
                    glb.ctx.strokeStyle = "orange";
                } else {
                    // blue for in only
                    glb.ctx.strokeStyle = "blue";
                }
            } else {
                if(this.out_connected){
                    // green for out only
                    glb.ctx.strokeStyle = "green";
                } else {
                    // white for none
                    glb.ctx.strokeStyle = "white";
                }
            }
            glb.ctx.beginPath();
            glb.ctx.moveTo(this.p.x + 7, this.p.y);
            glb.ctx.arc(this.p.x, this.p.y, 7, 0, 2*Math.PI);
            glb.ctx.stroke();
        } else {
            // If this is a wire not connected to a cog wire, draw a spark
            if(this.in_power instanceof Wire && !this.out_connected && this.is_on) {
                Spark.draw(this.p);
            }
        }
        // only draw if wire. Cogs take care of their own drawing
        if(this.out_power instanceof Wire) this.out_power.draw();
    }
}