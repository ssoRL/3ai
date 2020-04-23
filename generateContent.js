var marked = require('marked');
var fs = require('fs');

var readMe = fs.readFileSync('story/orth.md', 'utf-8');
var markdownContent = marked(readMe);

fs.writeFileSync('./story/orth.html', markdownContent);
