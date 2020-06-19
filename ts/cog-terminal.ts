interface CogTerminal {
    outer: boolean;
    index: number;
}

/**
 * Helper function to create an outer cog terminal
 * @param i The index to go to
 */
function ct (i: number): CogTerminal {
    return {outer: true, index: i}
}

/**
 * Helper function to create an inner cog terminal
 * @param i The index to go to
 */
function ct_i (i: number): CogTerminal {
    return {outer: false, index: i}
}