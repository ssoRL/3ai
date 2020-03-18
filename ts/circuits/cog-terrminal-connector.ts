type PowerSource = [Cog, CogTerminal] | Wire;

class CogTerminalConnecor implements Conductor, TickWatcher {
    is_on: boolean;
    /** The wire or cog that power comes from */
    private in_power: PowerSource;
    /** The wire that it goes to */
    private out_power: PowerSource;

    /** Whether the connection is made with the input */
    private in_connected: boolean;
    /** Whether the connection is made with the output */
    private out_connected: boolean;

    constructor(in_power_: PowerSource, out_connection_: PowerSource) {
        this.in_power = in_power_;
        this.out_power = out_connection_;
        // Add self to watch ticks
        for(const source of [this.in_power, this.out_power]) {
            if(!(source instanceof Wire)) {
                source[0].addTickWatcher(this);
            }
        }
        this.endTick();
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
        if(this.is_on && this.in_connected && this.out_connected) {
            if(this.out_power instanceof Wire) {
                this.out_power.power(true);
            } else {
                const cog_wire = this.out_power[0].etched_wire;
                cog_wire?.power(true, this.out_power[1]);
            }
        }
    }

    public power(on: boolean): void {
        this.is_on = on;
        this.sendPowerIfConnected();
    }

    // Break all connections when a tick starts
    startTick(): void {
        this.in_connected = false;
        this.out_connected = false;
        if(this.out_power instanceof Wire) {
            this.out_power.power(false);
        }else{
            this.out_power[0].etched_wire?.power(false);
        }
    }
    
    endTick(): void {
        this.in_connected = this.isConnected(this.in_power);
        this.out_connected = this.isConnected(this.out_power);
        this.sendPowerIfConnected();
    }
    
    draw(ctx: CanvasRenderingContext2D, time: number): void {
        // Don't draw anything
    }
}