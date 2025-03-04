import * as utils from './common/utils.js'
import * as helpers from './helpers/index.js'
import Renderer from './render/renderer.js'
import ParserCore from './parsers/parser_core.js'
import ParserBlock from './parsers/parser_block.js'
import ParserInline from './parsers/parser_inline.js'
import preset_default from './presets/default.js'
import LinkifyIt from 'linkify-it'
import * as mdurl from 'mdurl'
import punycode from 'punycode.js'


// 定义 MarkdownIt 实例的结构
class Markdown2Html {
  inline: ParserInline;
  block: ParserBlock;
  core: ParserCore;
  renderer: any;
  linkify: any;
  validateLink: Function;
  normalizeLink: Function;
  utils: typeof utils;
  helpers: typeof helpers;
  options: any;

  constructor() {
    this.inline = new ParserInline();
    this.block = new ParserBlock();
    this.core = new ParserCore();
    this.renderer = new Renderer();
    this.linkify = new LinkifyIt()
    this.validateLink = validateLink
    this.normalizeLink = normalizeLink
    this.utils = utils;
    this.helpers = utils.assign({}, helpers);
    this.options = {};
    this.set(preset_default.options)
  }

  set(options: any): this {
    utils.assign(this.options, options);
    return this;
  }

  parse(src: string, env: any = {}): any[] {
    if (typeof src !== 'string') {
      throw new Error('Input data should be a String');
    }

    const state = new this.core.State(src, this, env);
    this.core.process(state);

    return state.tokens;
  }

  render(src: string, env: any = {}): string {
    return this.renderer.render(this.parse(src, env), this.options, env);
  }

}

const BAD_PROTO_RE = /^(vbscript|javascript|file|data):/
const GOOD_DATA_RE = /^data:image\/(gif|png|jpeg|webp);/

function validateLink (url) {
  // url should be normalized at this point, and existing entities are decoded
  const str = url.trim().toLowerCase()

  return BAD_PROTO_RE.test(str) ? GOOD_DATA_RE.test(str) : true
}

const RECODE_HOSTNAME_FOR = ['http:', 'https:', 'mailto:']

function normalizeLink (url) {
  const parsed = mdurl.parse(url, true)

  if (parsed.hostname) {
    // Encode hostnames in urls like:
    // `http://host/`, `https://host/`, `mailto:user@host`, `//host/`
    //
    // We don't encode unknown schemas, because it's likely that we encode
    // something we shouldn't (e.g. `skype:name` treated as `skype:host`)
    //
    if (!parsed.protocol || RECODE_HOSTNAME_FOR.indexOf(parsed.protocol) >= 0) {
      try {
        parsed.hostname = punycode.toASCII(parsed.hostname)
      } catch (er) { /**/ }
    }
  }

  return mdurl.encode(mdurl.format(parsed))
}

export default Markdown2Html;
