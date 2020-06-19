/**
 *  Initializes the words writen on the main page that give a quick 
 *  description of the site
 */
function init_words() {
    // The words that show up on the main page
    Cog.getCogBySerialNumber(1002).addWord(new Word("3 Tales", p(-20, 70), "italic bold"));
    Cog.getCogBySerialNumber(1000).addWord(new Word("of how", p(60, -20), "", 20, "sans-serif").right());
    Cog.getCogBySerialNumber(1000).addWord(new Word("the", p(60, 0), "", 20, "sans-serif").right());
    //glb.kudzu_story_controller.words.push(new Word("Robots", p(350, 340), "bold", 30, "monospace").right());
    //glb.kudzu_story_controller.words.push(new Word("WIN", p(350, 340), "bold", 60, "math"));
    //glb.kudzu_story_controller.words.push(new Word("with never", p(970, 780), "", 22, "monospace").right());
    //glb.kudzu_story_controller.words.push(new Word("a drop", p(970, 802), "", 22, "monospace").right());
    //glb.kudzu_story_controller.words.push(new Word("of", p(970, 824), "", 22, "monospace").right());
    Cog.getCogBySerialNumber(4000).addWord(new Word("Blood", p(-25, -45), "bold italic", 25));
    Cog.getCogBySerialNumber(4000).addWord(new Word("SPILLED", p(-50, -20), "bold"));
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