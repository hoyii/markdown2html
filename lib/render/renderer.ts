import { assign, unescapeAll, escapeHtml } from '../common/utils.js'

const default_rules: Record<string, Function> = {}

default_rules.code_inline = function (tokens: any[], idx: number, options: any, env: any, slf: any): string {
  const token = tokens[idx]
  return  '<code' + slf.renderAttrs(token) + '>' +
          escapeHtml(token.content) +
          '</code>'
}

default_rules.code_block = function (tokens: any[], idx: number, options: any, env: any, slf: any): string {
  const token = tokens[idx]
  return  '<pre' + slf.renderAttrs(token) + '><code>' +
          escapeHtml(tokens[idx].content) +
          '</code></pre>\n'
}

default_rules.fence = function (tokens: any[], idx: number, options: any, env: any, slf: any): string {
  const token = tokens[idx]
  const info = token.info ? unescapeAll(token.info).trim() : ''
  let langName = ''
  let langAttrs = ''

  if (info) {
    const arr = info.split(/(\s+)/g)
    langName = arr[0]
    langAttrs = arr.slice(2).join('')
  }

  let highlighted
  if (options.highlight) {
    highlighted = options.highlight(token.content, langName, langAttrs) || escapeHtml(token.content)
  } else {
    highlighted = escapeHtml(token.content)
  }

  if (highlighted.indexOf('<pre') === 0) {
    return highlighted + '\n'
  }

  if (info) {
    const i = token.attrIndex('class')
    const tmpAttrs = token.attrs ? token.attrs.slice() : []

    if (i < 0) {
      tmpAttrs.push(['class', options.langPrefix + langName])
    } else {
      tmpAttrs[i] = tmpAttrs[i].slice()
      tmpAttrs[i][1] += ' ' + options.langPrefix + langName
    }

    const tmpToken = {
      attrs: tmpAttrs
    }

    return `<pre><code${slf.renderAttrs(tmpToken)}>${highlighted}</code></pre>\n`
  }

  return `<pre><code${slf.renderAttrs(token)}>${highlighted}</code></pre>\n`
}

default_rules.image = function (tokens: any[], idx: number, options: any, env: any, slf: any): string {
  const token = tokens[idx]
  token.attrs[token.attrIndex('alt')][1] =
    slf.renderInlineAsText(token.children, options, env)

  return slf.renderToken(tokens, idx, options)
}

default_rules.hardbreak = function (tokens: any[], idx: number, options: any): string {
  return options.xhtmlOut ? '<br />\n' : '<br>\n'
}

default_rules.softbreak = function (tokens: any[], idx: number, options: any): string {
  return options.breaks ? (options.xhtmlOut ? '<br />\n' : '<br>\n') : '\n'
}

default_rules.text = function (tokens: any[], idx: number): string {
  return escapeHtml(tokens[idx].content)
}

default_rules.html_block = function (tokens: any[], idx: number): string {
  return tokens[idx].content
}

default_rules.html_inline = function (tokens: any[], idx: number): string {
  return tokens[idx].content
}

function Renderer () {
  this.rules = assign({}, default_rules)
}

Renderer.prototype.renderAttrs = function renderAttrs (token: any): string {
  let i, l, result

  if (!token.attrs) { return '' }

  result = ''

  for (i = 0, l = token.attrs.length; i < l; i++) {
    result += ' ' + escapeHtml(token.attrs[i][0]) + '="' + escapeHtml(token.attrs[i][1]) + '"'
  }

  return result
}

Renderer.prototype.renderToken = function renderToken (tokens: any[], idx: number, options: any): string {
  const token = tokens[idx]
  let result = ''

  if (token.hidden) {
    return ''
  }

  if (token.block && token.nesting !== -1 && idx && tokens[idx - 1].hidden) {
    result += '\n'
  }

  result += (token.nesting === -1 ? '</' : '<') + token.tag
  result += this.renderAttrs(token)

  if (token.nesting === 0 && options.xhtmlOut) {
    result += ' /'
  }

  let needLf = false
  if (token.block) {
    needLf = true

    if (token.nesting === 1) {
      if (idx + 1 < tokens.length) {
        const nextToken = tokens[idx + 1]

        if (nextToken.type === 'inline' || nextToken.hidden) {
          needLf = false
        } else if (nextToken.nesting === -1 && nextToken.tag === token.tag) {
          needLf = false
        }
      }
    }
  }

  result += needLf ? '>\n' : '>'

  return result
}

Renderer.prototype.renderInline = function (tokens: any[], options: any, env: any): string {
  let result = ''
  const rules = this.rules

  for (let i = 0, len = tokens.length; i < len; i++) {
    const type = tokens[i].type

    if (typeof rules[type] !== 'undefined') {
      result += rules[type](tokens, i, options, env, this)
    } else {
      result += this.renderToken(tokens, i, options)
    }
  }

  return result
}

Renderer.prototype.renderInlineAsText = function (tokens: any[], options: any, env: any): string {
  let result = ''

  for (let i = 0, len = tokens.length; i < len; i++) {
    switch (tokens[i].type) {
      case 'text':
        result += tokens[i].content
        break
      case 'image':
        result += this.renderInlineAsText(tokens[i].children, options, env)
        break
      case 'html_inline':
      case 'html_block':
        result += tokens[i].content
        break
      case 'softbreak':
      case 'hardbreak':
        result += '\n'
        break
      default:
    }
  }

  return result
}

Renderer.prototype.render = function (tokens: any[], options: any, env: any): string {
  let result = ''
  const rules = this.rules

  for (let i = 0, len = tokens.length; i < len; i++) {
    const type = tokens[i].type

    if (type === 'inline') {
      result += this.renderInline(tokens[i].children, options, env)
    } else if (typeof rules[type] !== 'undefined') {
      result += rules[type](tokens, i, options, env, this)
    } else {
      result += this.renderToken(tokens, i, options, env)
    }
  }

  return result
}

export default Renderer
