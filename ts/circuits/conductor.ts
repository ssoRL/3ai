interface Conductor {
    power(on: boolean): void;
    draw(ctx: CanvasRenderingContext2D, time: number): void;
}