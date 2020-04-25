/**
 * Set up the cogs for the orthoganal machines story
 * @returns A list of cogs that should be driven by the orthoganal machines story controller
 */
function init_cogs_orth(): Cog[]{
    const driver_cogs: Cog[] = [];

    // Cogs on the left
    const left_driver = new Cog(90, 1720, 6, SpinDirection.CLOCKWISE, -0.2, 5000);
    driver_cogs.push(left_driver);
    left_driver.addDrivenCog(4, 6).addDrivenCog(3, 8);
    left_driver.addDrivenCog(2, 12).addDrivenCog(3, 6).addDrivenCog(2, 8).addDrivenCog(5, 6);

    //Cogs on the right
    const right_driver = new Cog(950, 1980, 7, SpinDirection.CLOCKWISE, 0, 6000);
    driver_cogs.push(right_driver);
    right_driver.addDrivenCog(1, 8).addDrivenCog(4, 6);
    right_driver.addDrivenCog(4, 6).addDrivenCog(3, 12).addDrivenCog(8, 6);

    return driver_cogs;
}