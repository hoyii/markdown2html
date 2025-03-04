const Markdown2Html = require('../dist/cjs/index.js')

const mark = new Markdown2Html()

// console.log(mark.renderer.render(mark.parse('## Hello *world* !')))

console.log(mark.render('![Picture](https://imzbf.github.io/md-editor-rt/imgs/mark_emoji.gif)'))
