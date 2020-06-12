/**
 * Set up the cogs for the orthoganal machines story
 * @returns The driver cog for the cogs in the orthogonal machine section
 */
function init_cogs_orth(): {learn_stop_cog: Cog, learn_start_cog: Cog} {

    const learn_start_cog = new Cog(500, 2450, 6, SpinDirection.CLOCKWISE, Math.PI/2, 5000);

    const left_driver = learn_start_cog.addDrivenCog(1, 6).addDrivenCog(3, 8);
    left_driver.addDrivenCog(2, 6).addDrivenCog(2, 12);
    left_driver
        .addDrivenCog(4, 6).addDrivenCog(3, 8).addDrivenCog(5, 6)
        .addDrivenCog(1, 6).addDrivenCog(3, 8);

    const right_driver = learn_start_cog.addDrivenCog(4, 6).addDrivenCog(3, 12);
    right_driver
        .addDrivenCog(2, 6).addDrivenCog(2, 8).addDrivenCog(5, 6).addDrivenCog(1, 6)
        .addDrivenCog(3, 8).addDrivenCog(3, 12);
    right_driver.addDrivenCog(6, 6);

    const learn_stop_cog = new Cog(375, 2125, 8, SpinDirection.CLOCKWISE, 0, 6000);
    learn_stop_cog.addDrivenCog(7, 6);

    return {learn_stop_cog: learn_stop_cog, learn_start_cog: learn_start_cog};
}