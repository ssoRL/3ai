class Word {
    public words: string;
    public style: string
    public size: number;
    public font: string;
    public position: Point;

    constructor(words_: string, position_: Point, style_ = "", size_?: number, font_?: string) {
        this.words = words_;
        this.position = position_;

        this.style = style_;
        this.size = size_ ?? 30;
        this.font = font_ ?? "serif";
    }

    draw() {
        glb.ctx.font = `${this.style} ${this.size}px ${this.font}`;
        glb.ctx.fillText(this.words, this.position.x, this.position.y);
    }
} 