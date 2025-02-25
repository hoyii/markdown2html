import MarkdownIt from '../lib/index.js'

const mark = new MarkdownIt()

console.log(mark.renderer.render(mark.parse('## Hello *world* !')))

// console.log(mark.parse('Hello *world*!', {}))
