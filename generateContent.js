var marked = require('marked');
var fs = require('fs');

// Generate "The Orthogonal Machines"
var readOrth = fs.readFileSync('story/orth.md', 'utf-8');
var orthContent = marked(readOrth);
fs.writeFileSync('./3ai/story/orth.html', orthContent);

// Generate "Vessels of Perfection"
var readPerfect = fs.readFileSync('story/perfect.md', 'utf-8');
var perfectContent = marked(readPerfect);
fs.writeFileSync('./3ai/story/perfect.html', perfectContent);

// Generate "Vines of Kudzu"
var readKudzu = fs.readFileSync('story/kudzu.md', 'utf-8');
// Split the ensuing file by kudzusectionbreak
var kudzuSections = readKudzu.split('\n\nkudzusectionbreak\n\n');
var kudzuParagraphs = [];
for(section of kudzuSections) {
    paragraphs = section.split('\n\n');
    kudzuParagraphs.push(paragraphs)
}
fs.writeFileSync('./3ai/story/kudzu.json', JSON.stringify(kudzuParagraphs));