/**
 *  Initializes the words written on the main page that give a quick 
 *  description of the site
 */
function init_words() {
    // The words that show up on the main page
    const cog_with_3 = Cog.getCogBySerialNumber(1000);
    const three_tales_size = 40;
    cog_with_3.addWord(new Word(
        "3", p(45, 0), "italic bold", three_tales_size, undefined, "right"
    ));
    const cog_with_3_ct_0 = cog_with_3.getCogTerminalPoint(ct(0));
    const cog_with_3_ct_5 = cog_with_3.getCogTerminalPoint(ct(5));
    const tales_y = (cog_with_3_ct_0.y + cog_with_3_ct_5.y) / 2;
    glb.kudzu_story_controller.words.push(new Word(
        "Tales", p(cog_with_3_ct_0.x, tales_y), "bold", three_tales_size
    ));
    glb.kudzu_story_controller.words.push(new Word(
        "of how the", p(280, 250), "", 25, "sans-serif"
    ));
    Cog.getCogBySerialNumber(2002).addWord(new Word(
        "Robots", p(80, -90), "bold", 30, "monospace", "right"
    ))
    glb.kudzu_story_controller.words.push(new Word(
        "WIN", p(390, 350), "bold", 50, "math"
    ));
    glb.kudzu_story_controller.words.push(new Word(
        "with", p(620, 750), "", 25, "monospace"
    ));
    glb.kudzu_story_controller.words.push(new Word(
        "never", p(620, 775), "", 25, "monospace"
    ));
    glb.kudzu_story_controller.words.push(new Word(
        "a drop", p(620, 800), "", 25, "monospace"
    ));
    const cog_of_blood_spilled = Cog.getCogBySerialNumber(4000);
    cog_of_blood_spilled.addWord(new Word(
        "of", p(0, -115), "", 25, "monospace", "center"
    ));
    cog_of_blood_spilled.addWord(new Word(
        "Blood", p(0, -55), "bold italic", 30, undefined, "center"
    ));
    cog_of_blood_spilled.addWord(new Word(
        "SPILLED", p(0, -25), "bold", 35, undefined, "center"
    ));
}

function init_orth_words() {
    // The words that give the instructions for the starting and stopping of cogs
    glb.kudzu_story_controller.words.push(new Word(
        "To stop a cog from turning:",
        p(300, 1875), "", 25, "monospace"
    ));
    glb.kudzu_story_controller.words.push(new Word(
        "click on the glowing green center",
        p(325, 1900), "", 25, "monospace"
    ));

    glb.kudzu_story_controller.words.push(new Word(
        "To start a cog spinning:",
        p(300, 2275), "", 25, "monospace"
    ));
    glb.kudzu_story_controller.words.push(new Word(
        "click on the glowing red center",
        p(325, 2300), "", 25, "monospace"
    ));
}