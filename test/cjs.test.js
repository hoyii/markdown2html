const MarkdownIt = require('markdown2html')

const mark = new MarkdownIt()

console.log(mark.render('Hello *world*!', {}))
