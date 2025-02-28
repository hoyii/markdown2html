import MarkdownIt from './index.js'

const mark = new MarkdownIt()

// console.log(mark.renderer.render(mark.parse('## Hello *world* !')))

console.log(mark.render('Hello *world*!', {}))
