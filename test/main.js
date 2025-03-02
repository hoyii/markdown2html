const Markdown2Html = require('../dist/esm/index.js')

const mark = new Markdown2Html()

// console.log(mark.renderer.render(mark.parse('## Hello *world* !')))

console.log(mark.render('## Hello *world*!', {}))
