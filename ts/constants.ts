/** Length of a tick in milliseconds */
const TICK_LENGTH = 200;

/** How often to call for a new tick */
const TICK_EVERY = 1000

/** The number of milliseconds needed before this gate powers up  */
const AND_POWER_UP_TIME = 10;

/** How long it keeps providing power after a connection is cut */
const AND_POWER_DOWN_TIME = 1500;

/** The length from the cog wheel to the edge of each tooth in the cog */
const TOOTH_LENGTH = 22;

/** The amount of space between the teeth at the pitch circle */
const GAP_WIDTH = 40;

/** Show graphics that are helpful for debugging, but not in final */
const SHOW_HELP_GRAPICS = true;

/** The speed of light thru wires in pixels per millisecond */
const SOL = 3;

/** Weather to tick or not */
const TICKING = true;

/** What effect click on a cog has */
const CLICK_ACTION: "stop" | "change" = "stop"; 