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
    glb.kudzu_story_controller.words.push(new Word(
        "Robots", p(330, 290), "bold", 35, "monospace"
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
        "of", p(0, -115), "bold", 30, undefined, "center"
    ));
    cog_of_blood_spilled.addWord(new Word(
        "Blood", p(0, -55), "bold italic", 30, undefined, "center"
    ));
    cog_of_blood_spilled.addWord(new Word(
        "SPILLED", p(0, -25), "bold", 35, undefined, "center"
    ));

    Cog.getCogBySerialNumber(3000).addWord(new Word(
        "by", p(23, -15), "italic"
    ))
    Cog.getCogBySerialNumber(3001).addWord(new Word(
        "Skyler", p(-110, 60), "bold italic"
    ))
    Cog.getCogBySerialNumber(3001).addWord(new Word(
        "Olson", p(-90, 90), "bold italic"
    ))
}

/** Instructions for stopping a spinning cog */
function init_orth_words_stopping() {
    // The words that give the instructions for the starting and stopping of cogs
    glb.kudzu_story_controller.words.push(new Word(
        "If a cog is spinning:",
        p(300, 1875), "", 25, "monospace"
    ));
    glb.kudzu_story_controller.words.push(new Word(
        "You can stop it by clicking",
        p(325, 1900), "", 25, "monospace"
    ));
    glb.kudzu_story_controller.words.push(new Word(
        "on the green center",
        p(350, 1925), "", 25, "monospace"
    ));
}

function init_orth_words_starting() {
    glb.kudzu_story_controller.words.push(new Word(
        "If a cog is stopped:",
        p(300, 2275), "", 25, "monospace"
    ));
    glb.kudzu_story_controller.words.push(new Word(
        "You can start it by clicking",
        p(325, 2300), "", 25, "monospace"
    ));
    glb.kudzu_story_controller.words.push(new Word(
        "on the red center",
        p(350, 2325), "", 25, "monospace"
    ));
}