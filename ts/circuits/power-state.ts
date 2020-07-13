/** Distinguishes the states of powering that a circuit element can be in */
enum Power {
    /** Is turning on */
    UP,
    /** Is turning off */
    DOWN,
    /** Is on */
    ON,
    /** Is off */
    OFF
}

/** Return if this conductor will be turning the conductor on */
function isOn(power_state: Power): boolean {
    return power_state === Power.ON || power_state === Power.UP
}

/** Returns true if the conductor is in transition */
function isTransition(power_state: Power): boolean {
    return power_state === Power.UP || power_state === Power.DOWN;
}