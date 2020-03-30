interface Clickable {
    /** Return weather this clickable is effected by a click at p */
    isClicked(p: Point): boolean;
    /** take the action on a click event */
    click(): void;
}