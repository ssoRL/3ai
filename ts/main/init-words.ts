/**
 *  Initializes the words writen on the main page that give a quick 
 *  description of the site
 */
function init_words() {
    Cog.getCogBySerialNumber(1002).addWord(new Word("3 Tales", p(-20, 70), "italic bold"));
    Cog.getCogBySerialNumber(1000).addWord(new Word("of how", p(0, -20), "", 20, "sans-serif"));
    Cog.getCogBySerialNumber(1000).addWord(new Word("the", p(30, 0), "", 20, "sans-serif"));
    Cog.getCogBySerialNumber(4000).addWord(new Word("Blood", p(-25, -45), "bold italic", 25));
    Cog.getCogBySerialNumber(4000).addWord(new Word("SPILLED", p(-50, -20), "bold"));
}