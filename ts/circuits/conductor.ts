interface Conductor {
    power(on: boolean, switch_time: number): void;
    draw(): void;
}