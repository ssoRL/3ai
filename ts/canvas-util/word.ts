class Word {
    private words: string;
    private style: string
    private size: number;
    private font: string;
    private position: Point;
    private align: CanvasTextAlign;

    constructor(
        words_: string,
        position_: Point,
        style_ = "",
        size_?: number,
        font_?: string,
        align_?: CanvasTextAlign
    ) {
        this.words = words_;
        this.position = position_;

        this.style = style_;
        this.size = size_ ?? 30;
        this.font = font_ ?? "serif";
        this.align = align_ ?? "left";
    }

    draw() {
        glb.ctx.font = `${this.style} ${this.size}px ${this.font}`;
        glb.ctx.textAlign = this.align;
        glb.ctx.textBaseline = "middle";
        glb.ctx.fillText(this.words, this.position.x, this.position.y);
    }
} 