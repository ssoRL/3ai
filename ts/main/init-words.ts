/**
 *  Initializes the words written on the main page that give a quick 
 *  description of the site
 */
function init_words() {
    // The words that show up on the main page
    const cog_with_3 = Cog.getCogBySerialNumber(1000);
    cog_with_3.addWord(new Word(
        "3", p(50, 0), "italic bold", 50, undefined, "right"
    ));
    const cog_with_3_ct_0 = cog_with_3.getCogTerminalPoint(ct(0));
    const cog_with_3_ct_5 = cog_with_3.getCogTerminalPoint(ct(5));
    const tales_y = (cog_with_3_ct_0.y + cog_with_3_ct_5.y) / 2;
    glb.kudzu_story_controller.words.push(new Word(
        "Tales", p(cog_with_3_ct_0.x + 15, tales_y - 16), "bold", 32
    ));
    glb.kudzu_story_controller.words.push(new Word(
        "of", p(cog_with_3_ct_0.x + 15, tales_y + 16), "bold", 32,
    ));

    glb.kudzu_story_controller.setAWord(0, false);
    glb.kudzu_story_controller.setIWord(0, false);

    const byline_cog = Cog.getCogBySerialNumber(4000);
    byline_cog.addWord(new Word(
        "by", p(0, -115), "italic", 25, undefined, "center"
    ));
    byline_cog.addWord(new Word(
        "Skyler", p(0, -60), "bold italic", 30, undefined, "center"
    ));
    byline_cog.addWord(new Word(
        "Olson", p(0, -30), "bold italic", 30, undefined, "center"
    ));
    
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