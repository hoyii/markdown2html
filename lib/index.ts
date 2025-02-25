import * as utils from './common/utils.js'
import * as helpers from './helpers/index.js'
import Renderer from './render/renderer.js'
import ParserCore from './parsers/parser_core.js'
import ParserBlock from './parsers/parser_block.js'
import ParserInline from './parsers/parser_inline.js'

// 定义 MarkdownIt 的选项类型
interface MarkdownItOptions {
  // 可以在这里定义你具体的选项字段
  [key: string]: any;
}

// 定义环境类型
interface Env {
  [key: string]: any;
}

// 定义 MarkdownIt 实例的结构
class MarkdownIt {
  inline: ParserInline;
  block: ParserBlock;
  core: ParserCore;
  renderer: any;
  utils: typeof utils;
  helpers: typeof helpers;
  options: MarkdownItOptions;

  constructor() {
    this.inline = new ParserInline();
    this.block = new ParserBlock();
    this.core = new ParserCore();
    this.renderer = new Renderer();
    this.utils = utils;
    this.helpers = utils.assign({}, helpers);
    this.options = {};
  }

  set(options: MarkdownItOptions): this {
    utils.assign(this.options, options);
    return this;
  }

  parse(src: string, env: Env = {}): any[] {
    if (typeof src !== 'string') {
      throw new Error('Input data should be a String');
    }

    const state = new this.core.State(src, this, env);
    this.core.process(state);

    return state.tokens;
  }

  render(src: string, env: Env = {}): string {
    return this.renderer.render(this.parse(src, env), this.options, env);
  }
}

export default MarkdownIt;
