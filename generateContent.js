import { marked } from 'marked';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
var storyDir = "./3ai/story";

// Create story directory if it doesn't exist
if(!existsSync(storyDir)) {
    mkdirSync(storyDir);
}

// Generate "The Orthogonal Machines"
var readOrth = readFileSync('story/orth.md', 'utf-8');
var orthContent = marked.parse(readOrth);
writeFileSync(`${storyDir}/orth.html`, orthContent);

// Generate "Vessels of Perfection"
var readPerfect = readFileSync('story/perfect.md', 'utf-8');
var perfectContent = marked(readPerfect);
writeFileSync(`${storyDir}/perfect.html`, perfectContent);

// Generate "Vines of Kudzu"
var readKudzu = readFileSync('story/kudzu.md', 'utf-8');
// Split the ensuing file by ---
var kudzuSections = readKudzu.split(/\n\n----*\n\n/);
var kudzuParagraphs = [];
for(const section of kudzuSections) {
    const paragraphs = section.split('\n\n');
    kudzuParagraphs.push(paragraphs);
}
writeFileSync(`${storyDir}/kudzu.json`, JSON.stringify(kudzuParagraphs));