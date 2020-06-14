class Spark {

    /**
     * Create a white circle of random size
     * @param p The point to draw the spark at
     */
    public static draw(p: Point) {
        // determine the size
        const size = 4 + Math.random()*6;

        const grad = glb.ctx.createRadialGradient(
            p.x, p.y, 0,
            p.x, p.y, size
        );
        grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)')

        // draw it
        glb.ctx.fillStyle = grad;
        glb.ctx.beginPath();
        glb.ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        glb.ctx.fill();
    }
}