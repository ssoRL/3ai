class InvoluteCogRenderer {

    private spur_count: number;
    private draw_path: Path2D;

    /** The radius of the pitch circle */
    public pitch_radius: number;
    /** The radius of the inner cicle (the wheel of the cog) */
    private inner_radius: number;
    /** The radius of the outer circle where the teeth end */
    private outer_radius: number;
    /** The angle to the point where the involute intersects the outer circle */
    private outer_intersect_arc: number;
    /** The distance from the control point to the center of the circle */
    private control_point_radius: number;
    /** The angle taken up by one section (tooth and adjacent wheel) */
    private section_arc: number;
    // The part of the section taken up by the base (wheel)
    private base_arc: number;
    // The part taken up by the top of the tooth
    private tooth_top_arc: number;

    constructor(spur_count: number) {
        this.spur_count = spur_count;
        this.section_arc = 2 * Math.PI / spur_count;

        // Calculate the radii of the various parts of the cog
        this.pitch_radius = GAP_WIDTH * spur_count / Math.PI;
        this.inner_radius = this.pitch_radius - TOOTH_LENGTH / 2;
        this.outer_radius = this.pitch_radius + TOOTH_LENGTH / 2;
        let radius_fraction = this.inner_radius / this.outer_radius;

        // Calculate the outer_intersect_arc
        let intersect_to_inner_tangent_arc = Math.acos(radius_fraction);
        let zero_to_inner_tangent_arc = Math.tan(intersect_to_inner_tangent_arc);
        this.outer_intersect_arc = zero_to_inner_tangent_arc - intersect_to_inner_tangent_arc;

        // Find the distance of the control point that defines the
        // involute from the center of the circle
        // Start by calculating the point outer_intersect_point
        let outer_intersect_point_x = Math.cos(this.outer_intersect_arc) * this.outer_radius;
        let outer_intersect_point_y = Math.sin(this.outer_intersect_arc) * this.outer_radius;
        // Then calculate the control point radius
        this.control_point_radius = outer_intersect_point_x - outer_intersect_point_y / Math.tan(zero_to_inner_tangent_arc);

        // Then, need to find the arc portion of the upper and lower involute
        // so that the arc parts of the base and tooth end arcs can be properly
        // apportioned. Start by finding the center point of the involute.
        let involute_center_x = (this.inner_radius + 2*this.control_point_radius + outer_intersect_point_x) / 4;
        let involute_center_y = outer_intersect_point_y / 4;
        let lower_involute_arc = Math.atan(involute_center_y / involute_center_x);
        let upper_involute_arc = this.outer_intersect_arc - lower_involute_arc;
        this.base_arc = this.section_arc / 2 - lower_involute_arc * 2;
        this.tooth_top_arc = this.section_arc / 2 - upper_involute_arc * 2;

        this.draw_path = this.generateDrawPath();
    }

    public draw(ctx: CanvasRenderingContext2D){
        ctx.stroke(this.draw_path);
    }

    /**
     * @returns The angle that the cog should be rotated to get the center of the
     * tooth to 0rad
     */
    public getToothCenterArc(){
        return this.outer_intersect_arc + this.tooth_top_arc / 2;
    }

    /**
     * @returns The angle that the cog should be rotated to get the center of the
     * base part of the cog to 0rad
     */
    public getBaseCenterArc(){
        return -this.base_arc / 2;
    }

    /**
     * 
     * @param r The distance of this point from (0, 0)
     * @param a The angle of this point from 0rad
     * @returns A tuple of the point 
     */
    private getPoint(r: number, a: number): {x: number, y:number}{
        let x = r * Math.cos(a);
        let y = r * Math.sin(a);
        return {x: x, y: y};
    }

    private generateDrawPath(): Path2D {
        let path = new Path2D();
        path.moveTo(0, 0);
        path.lineTo(this.inner_radius, 0)
        let i =0;
        for(let i=0; i< this.spur_count; i++) {
            // The angle that this section of spur starts on
            let theta_0 = i * this.section_arc;
            // First draw the inner cog
            let base_end_arc = theta_0 + this.base_arc;
            path.arc(0, 0, this.inner_radius, theta_0, base_end_arc);

            // Then draw one of the involutes
            // calculate the control point
            let cp = this.getPoint(this.control_point_radius, base_end_arc);
            // calculate the addendum intersect point
            let intersect_arc = base_end_arc + this.outer_intersect_arc;
            let intersect = this.getPoint(this.outer_radius, intersect_arc);
            // draw the involute
            path.quadraticCurveTo(cp.x, cp.y, intersect.x, intersect.y);

            // Draw the top of the tooth
            let far_intersect_arc = intersect_arc + this.tooth_top_arc;
            path.arc(0, 0, this.outer_radius, intersect_arc, far_intersect_arc);

            // Draw the concluding involute
            let end_arc = theta_0 + this.section_arc;
            let end_intersect = this.getPoint(this.inner_radius, end_arc);
            let end_cp = this.getPoint(this.control_point_radius, end_arc);
            path.quadraticCurveTo(end_cp.x, end_cp.y, end_intersect.x, end_intersect.y);
        }
        //path.closePath();
        return path;
    }
}