type PowerSource = [Cog, CogTerminal] | Wire;

class CogTerminalConnector implements Conductor, TickWatcher {
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
        // Add self to watch ticks
        for(const source of [this.in_power, this.out_power]) {
            if(!(source instanceof Wire)) {
                source[0].addTickWatcher(this);
            }
        }
        this.endTick();
        if(this.in_power instanceof Wire) {
            if(this.out_power instanceof Wire) {
                throw "3AI Error: terminal should NOT be between two wires";
            }
            this.p = this.out_power[0].getCogTerminalPoint(this.out_power[1]);
        } else {
            this.p = this.in_power[0].getCogTerminalPoint(this.in_power[1]);
        }

        // Add this cog terminal connection to the etched wire's list if there is one
        if(this.in_power instanceof Wire) {
            this.in_power.addTerminalConnectionToChildren(this);
        } else {
            if(this.in_power[0].etched_wire){
                this.in_power[0].etched_wire.out_terminals.push(this);
            }
        }
    }

    public getInTerminal(): CogTerminal {
        if(this.in_power instanceof Wire){
            throw "3AI Error: Wire's have no terminal definition"
        }
         return this.in_power[1];
        
    }

    isConnected(source: PowerSource): boolean {
        if(source instanceof Wire){
            return true;
        }
        // Check if the cog is in position for this terminal to hit a wire
        const cog_wire = source[0].etched_wire;
        if(!cog_wire){
            return false;
        }
        return cog_wire.isConnectedWith(source[1]);
    }

    private sendPowerIfConnected(){
        if(this.in_connected && this.out_connected){
            if(this.out_power instanceof Wire) {
                this.out_power.power(this.is_on);
            } else {
                const cog_wire = this.out_power[0].etched_wire;
                cog_wire?.power(this.is_on, this.out_power[1]);
            }
        }
    }

    public power(on: boolean): void {
        if(this.in_power instanceof Wire) {
            //console.log(`power from wire ${on}`);
        }
        this.is_on = on;
        this.sendPowerIfConnected();
    }

    // Break all connections when a tick starts
    startTick(): void {
        this.in_connected = false;
        this.out_connected = false;
        if(!(this.in_power instanceof Wire)) {
            this.is_on = false;
        }
        if(this.out_power instanceof Wire) {
            this.out_power.power(false);
        }else{
            this.out_power[0].etched_wire?.power(false, this.out_power[1]);
        }
    }
    
    endTick(): void {
        this.in_connected = this.isConnected(this.in_power);
        this.out_connected = this.isConnected(this.out_power);
        this.sendPowerIfConnected();
    }
    
    draw(): void {
        if(SHOW_HELP_GRAPICS){
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
            // Chhange the collor of the smaller inner circle for connect info
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
        }
        // only draw if wire. Cogs take care of their own drawing
        if(this.out_power instanceof Wire) this.out_power.draw();
    }
}