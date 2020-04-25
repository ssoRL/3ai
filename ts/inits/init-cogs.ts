/**
 * Set up the cogs 
 * @returns A list of cogs that should be driven by the top level
 */
function init_cogs(): Cog[]{
    const driver_cogs: Cog[] = [];
    // Cogs in the upper left
    const up_left_driver = new Cog(260, 200, 8, SpinDirection.CLOCKWISE, 0, 1000);
    driver_cogs.push(up_left_driver);
    const up_left_1001 = up_left_driver.addDrivenCog(4, 6);
    up_left_1001.addDrivenCog(4, 8);
    up_left_1001.addDrivenCog(1, 6);

    // The cluster in the center
    const center_driver = new Cog(400, 700, 6, SpinDirection.COUNTER_CLOCKWISE, 0, 2000);
    driver_cogs.push(center_driver);
    center_driver.addDrivenCog(3, 6).addDrivenCog(4, 8);
    center_driver.addDrivenCog(1, 6);
    
    // Cogs in the middle right
    const low_right_driver = new Cog(800, 650, 6, SpinDirection.COUNTER_CLOCKWISE, 0, 3000);
    driver_cogs.push(low_right_driver);
    low_right_driver.addDrivenCog(5, 8);
    low_right_driver.addDrivenCog(3, 6);

    // Cogs in the lower right
    const low_driver = new Cog(800, 950, 12, SpinDirection.CLOCKWISE, 0.2, 4000);
    driver_cogs.push(low_driver);
    low_driver.addDrivenCog(6, 6);
    const out_of_sight = low_driver.addDrivenCog(4, 6).addDrivenCog(3, 6);
    out_of_sight.addDrivenCog(1, 8).addDrivenCog(6, 6).addDrivenCog(3, 10);

    return driver_cogs;
}