class InvoluteCogRenderer {

    private spur_count: number;
    private draw_path: Path2D;

    /** The radius of the pitch circle */
    public pitch_radius: number;
    /** The radius of the outer circle where the teeth end */
    public outer_radius: number;
    /** The radius of the inner circle (the wheel of the cog) */
    public inner_radius: number;
    /** The angle to the point where the involute intersects the outer circle */
    private outer_intersect_arc: number;
    /** The distance from the control point to the center of the circle */
    private control_point_radius: number;
    /** The angle taken up by one section (tooth and adjacent wheel) */
    public section_arc: number;
    // The part of the section taken up by the base (wheel)
    private base_arc: number;
    // The part taken up by the top of the tooth
    private tooth_top_arc: number;

    // The sizes for the center circle
    private static readonly CENTER_CIRCLE_RADIUS_DRIVER = 10;
    private static readonly CENTER_CIRCLE_RADIUS_DRIVEN = 35;

    constructor(spur_count: number, is_driver: boolean) {
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
        // let involute_center_x = (this.inner_radius + 2*this.control_point_radius + outer_intersect_point_x) / 4;
        // let involute_center_y = outer_intersect_point_y / 4;
        let pitch_point = this.convergeBezierToPitchRadius(
            this.pitch_radius,
            this.inner_radius,
            this.control_point_radius,
            outer_intersect_point_x,
            outer_intersect_point_y
        );
        let lower_involute_arc = Math.atan(pitch_point.y / pitch_point.x);
        let upper_involute_arc = this.outer_intersect_arc - lower_involute_arc;
        this.base_arc = this.section_arc / 2 - lower_involute_arc * 2;
        this.tooth_top_arc = this.section_arc / 2 - upper_involute_arc * 2;

        this.draw_path = this.generateDrawPath(is_driver);
    }

    public draw(ctx: CanvasRenderingContext2D){
        ctx.fill(this.draw_path, "evenodd");
        ctx.stroke(this.draw_path);
    }

    /**
     * A function to calculate the point where the bezier intersects the pitch circle
     * @param pitch_radius 
     * @param inner_radius
     * @param cp_radius Radius of the control point
     * @param outer_x 
     * @param outer_y 
     */
    private convergeBezierToPitchRadius(
        pitch_radius: number,
        inner_radius: number,
        cp_radius: number,
        outer_x: number,
        outer_y: number
    ){
        // The Bezier function, returns the point at t
        let B = (t: number) => {
            // inverse of t 
            let it = 1 - t;
            let x = it*it*inner_radius + 2 * it * t * cp_radius + t * t * outer_x;
            let y = t * t * outer_y;
            return {x: x, y: y};
        };

        // Helper function to calculate the length from (0, 0) of a point
        let l = (p: Point) => {
            return Math.sqrt(p.x*p.x + p.y*p.y);
        }

        let target_diff = 0.1;
        let curr_diff = 1;
        let t = 0.6;
        let delta_t = 0.1;
        while (curr_diff > target_diff || curr_diff < -target_diff) {
            if(curr_diff > target_diff) {
                // then t needs to be smaller
                t -= delta_t;
            } else {
                t += delta_t;
            }
            // now make delta smaller so this converges
            delta_t /= 2;
            // find the current bezier point and see what it's diff from pitch is
            let bezier_point = B(t);
            curr_diff = l(bezier_point) - pitch_radius;
        }

        // return the point found that is close enough
        return B(t);
    }

    private generateDrawPath(is_driver: boolean): Path2D {
        let path = new Path2D();
        if(SHOW_HELP_GRAPHICS){
            // only show the 0rad line for dev work
            path.moveTo(0, 0);
            path.lineTo(this.inner_radius, 0);
        }
        // First draw half an inner arc so the tooth-gap is centered on 0rad
        path.arc(0, 0, this.inner_radius, 0, this.base_arc/2);
        //
        //const start_p = getPoint(this.inner_radius, 0);
        const move_to_p = getPoint(this.inner_radius, this.base_arc/2);
        let svg_d = `t${this.spur_count}: M ${move_to_p.x} ${move_to_p.y}\n`;
        //
        let i =0;
        for(let i=0; i< this.spur_count; i++) {
            // The angle that this section of the cog
            let theta_0 = i * this.section_arc + this.base_arc/2;

            // Start with an involute going up to the outer
            // calculate the control point
            let cp = getPoint(this.control_point_radius, theta_0);
            // calculate the addendum intersect point
            let near_outer_intersect_arc = theta_0 + this.outer_intersect_arc;
            let intersect = getPoint(this.outer_radius, near_outer_intersect_arc);
            // draw the involute
            path.quadraticCurveTo(cp.x, cp.y, intersect.x, intersect.y);

            //
            svg_d += `Q ${cp.x} ${cp.y} ${intersect.x} ${intersect.y}\n`;
            //

            // Draw the top of the tooth
            let far_outer_intersect_arc = near_outer_intersect_arc + this.tooth_top_arc;
            path.arc(0, 0, this.outer_radius, near_outer_intersect_arc, far_outer_intersect_arc);

            //
            const mid_tooth_intercept_arc = (near_outer_intersect_arc + far_outer_intersect_arc)/2;
            const tooth_mid_p = getPoint(this.outer_radius, mid_tooth_intercept_arc);
            const tooth_end_p = getPoint(this.outer_radius, far_outer_intersect_arc)
            svg_d += `A ${this.outer_radius} ${this.outer_radius} 0 0 1 ${tooth_mid_p.x} ${tooth_mid_p.y}\n`;
            svg_d += `A ${this.outer_radius} ${this.outer_radius} 0 0 1 ${tooth_end_p.x} ${tooth_end_p.y}\n`;
            //

            // Draw the involute back to base
            let inner_intersect_arc = far_outer_intersect_arc + this.outer_intersect_arc;
            let end_intersect = getPoint(this.inner_radius, inner_intersect_arc);
            let end_cp = getPoint(this.control_point_radius, inner_intersect_arc);
            path.quadraticCurveTo(end_cp.x, end_cp.y, end_intersect.x, end_intersect.y);


            //
            svg_d += `Q ${end_cp.x} ${end_cp.y} ${end_intersect.x} ${end_intersect.y}\n`;
            //

            // Finally, draw the tooth gap (base) part
            let end_arc = inner_intersect_arc + this.base_arc;
            path.arc(0, 0, this.inner_radius, inner_intersect_arc, end_arc);

            //
            const mid_base_intercept_arc = (inner_intersect_arc + end_arc)/2;
            const base_mid_p = getPoint(this.inner_radius, mid_base_intercept_arc);
            const base_end_p = getPoint(this.inner_radius, end_arc)
            svg_d += `A ${this.inner_radius} ${this.inner_radius} 0 0 1 ${base_mid_p.x} ${base_mid_p.y}\n`;
            svg_d += `A ${this.inner_radius} ${this.inner_radius} 0 0 1 ${base_end_p.x} ${base_end_p.y}\n`;
            //
        }
        svg_d += "Z";

        // Add the cut out circle in the middle
        const cut_out_radius = is_driver ? InvoluteCogRenderer.CENTER_CIRCLE_RADIUS_DRIVER : InvoluteCogRenderer.CENTER_CIRCLE_RADIUS_DRIVEN;
        path.moveTo(cut_out_radius, 0);
        path.arc(0, 0, cut_out_radius, 0, 2*Math.PI);
        //console.log(svg_d);
        //path.closePath();
        return path;
    }
}