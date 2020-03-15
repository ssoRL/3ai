interface Conductor {
    powerUp(source?: Point | CogTerminal): void;
    powerDn(source?: Point | CogTerminal): void;
    draw(ctx: CanvasRenderingContext2D, time: number): void;
}