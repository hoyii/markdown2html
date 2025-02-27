import * as utils from './common/utils.js'
import * as helpers from './helpers/index.js'
import Renderer from './render/renderer.js'
import ParserCore from './parsers/parser_core.js'
import ParserBlock from './parsers/parser_block.js'
import ParserInline from './parsers/parser_inline.js'

import preset_default from './presets/default.js'


// 定义 MarkdownIt 实例的结构
class MarkdownIt {
  inline: ParserInline;
  block: ParserBlock;
  core: ParserCore;
  renderer: any;
  utils: typeof utils;
  helpers: typeof helpers;
  options: any;

  constructor() {
    this.inline = new ParserInline();
    this.block = new ParserBlock();
    this.core = new ParserCore();
    this.renderer = new Renderer();
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

export default MarkdownIt;
