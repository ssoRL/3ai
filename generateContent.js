var marked = require('marked');
var fs = require('fs');
var storyDir = "./3ai/story";

// Create story directory if it doesn't exist
if(!fs.existsSync(storyDir)) {
    fs.mkdirSync(storyDir);
}

// Generate "The Orthogonal Machines"
var readOrth = fs.readFileSync('story/orth.md', 'utf-8');
var orthContent = marked(readOrth);
fs.writeFileSync(`${storyDir}/orth.html`, orthContent);

// Generate "Vessels of Perfection"
var readPerfect = fs.readFileSync('story/perfect.md', 'utf-8');
var perfectContent = marked(readPerfect);
fs.writeFileSync(`${storyDir}/perfect.html`, perfectContent);

// Generate "Vines of Kudzu"
var readKudzu = fs.readFileSync('story/kudzu.md', 'utf-8');
// Split the ensuing file by kudzusectionbreak
var kudzuSections = readKudzu.split('\n\nkudzusectionbreak\n\n');
var kudzuParagraphs = [];
for(section of kudzuSections) {
    paragraphs = section.split('\n\n');
    kudzuParagraphs.push(paragraphs);
}
fs.writeFileSync(`${storyDir}/kudzu.json`, JSON.stringify(kudzuParagraphs));