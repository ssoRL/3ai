/**
 * Set up the cogs 
 * @returns A list of cogs that should be driven by the top level
 */
function init_cogs(): Cog[]{
    const driver_cogs: Cog[] = [];
    // Cogs in the upper left
    const up_left_driver = new Cog(240, 160, 6, SpinDirection.CLOCKWISE, 0, 1000);
    driver_cogs.push(up_left_driver);
    const up_left_1001 = up_left_driver.addDrivenCog(3, 6);
    up_left_1001.addDrivenCog(4, 8);
    up_left_1001.addDrivenCog(1, 6);

    // The cluster in the center
    const center_driver = new Cog(300, 720, 6, SpinDirection.COUNTER_CLOCKWISE, -0.1, 2000);
    driver_cogs.push(center_driver);
    center_driver.addDrivenCog(3, 6).addDrivenCog(4, 12);
    center_driver.addDrivenCog(1, 6);
    
    // Cogs in the middle right
    /** Fun fact: if base_rotate is 0.2, Chrome has a bug where it screws up the gradient of the cog, hence 0.21 */
    const low_right_driver = new Cog(750, 680, 6, SpinDirection.CLOCKWISE, 0.21, 3000);
    driver_cogs.push(low_right_driver);
    low_right_driver.addDrivenCog(5, 12);
    low_right_driver.addDrivenCog(3, 6);

    // Cogs in the lower right
    const low_driver = new Cog(750, 985, 12, SpinDirection.CLOCKWISE, Math.PI/12, 4000);
    driver_cogs.push(low_driver);
    low_driver.addDrivenCog(6, 6);
    const out_of_sight = low_driver.addDrivenCog(4, 6).addDrivenCog(3, 6).addDrivenCog(1, 10);
    out_of_sight.addDrivenCog(4, 6);
    out_of_sight.addDrivenCog(7, 8).addDrivenCog(5, 10);

    // set these to be controlled by the global tick master
    glb.tick_master.addControlledCogs(driver_cogs);
    return driver_cogs;
}