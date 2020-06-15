var marked = require('marked');
var fs = require('fs');

var readOrth = fs.readFileSync('story/orth.md', 'utf-8');
var orthContent = marked(readOrth);

fs.writeFileSync('./story/orth.html', orthContent);

var readKudzu = fs.readFileSync('story/kudzu.md', 'utf-8');
// Split the ensuing file by kudzusectionbreak
var kudzuSections = readKudzu.split('\n\nkudzusectionbreak\n\n');
var kudzuParagraphs = [];
for(section of kudzuSections) {
    paragraphs = section.split('\n\n');
    kudzuParagraphs.push(paragraphs)
}
fs.writeFileSync('./story/kudzu.json', JSON.stringify(kudzuParagraphs));