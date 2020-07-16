/** Length of a tick in milliseconds */
const TICK_LENGTH = 400;

/** How often to call for a new tick */
const TICK_EVERY = 1500

/** The number of milliseconds needed before this gate powers up  */
const AND_POWER_UP_TIME = 10;

/** How long it keeps providing power after a connection is cut */
const AND_POWER_DOWN_TIME = TICK_EVERY * 1.2;

/** The length from the cog wheel to the edge of each tooth in the cog */
const TOOTH_LENGTH = 22;

/** The amount of space between the teeth at the pitch circle */
const GAP_WIDTH = 40;

/** The color to draw wires that are on */
const WIRE_ON_COLOR = 'rgb(250,196,196)';

/** Show graphics that are helpful for debugging, but not in final */
const SHOW_HELP_GRAPHICS = false;

/** The speed of light thru wires in pixels per millisecond */
const SOL = 3;

/** What effect click on a cog has */
const CLICK_ACTION: "stop" | "change" = "stop"; 

/** Hopefully this can be used to debug huge slowdowns :p */
var TRIP_WIRE = false;

/** Whether to allow fully skipping vines of kudzu */
const KUDZU_SKIP_OPTION = false;

/** Cookie names */
const ORTH_COOKIE_NAME = "orth_cookie";
const KUDZU_COOKIE_NAME = "kudzu_cookie";
const STORY_DONE = "story_done";