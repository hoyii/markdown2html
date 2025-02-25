import Ruler from '../ruler.js';
import StateInline from '../rulers/rules_inline/state_inline.js';

import r_text from '../rulers/rules_inline/text.js';
import r_linkify from '../rulers/rules_inline/linkify.js';
import r_newline from '../rulers/rules_inline/newline.js';
import r_escape from '../rulers/rules_inline/escape.js';
import r_backticks from '../rulers/rules_inline/backticks.js';
import r_strikethrough from '../rulers/rules_inline/strikethrough.js';
import r_emphasis from '../rulers/rules_inline/emphasis.js';
import r_link from '../rulers/rules_inline/link.js';
import r_image from '../rulers/rules_inline/image.js';
import r_autolink from '../rulers/rules_inline/autolink.js';
import r_html_inline from '../rulers/rules_inline/html_inline.js';
import r_entity from '../rulers/rules_inline/entity.js';

import r_balance_pairs from '../rulers/rules_inline/balance_pairs.js';
import r_fragments_join from '../rulers/rules_inline/fragments_join.js';

const _rules = [
  ['text', r_text],
  ['linkify', r_linkify],
  ['newline', r_newline],
  ['escape', r_escape],
  ['backticks', r_backticks],
  ['strikethrough', r_strikethrough.tokenize],
  ['emphasis', r_emphasis.tokenize],
  ['link', r_link],
  ['image', r_image],
  ['autolink', r_autolink],
  ['html_inline', r_html_inline],
  ['entity', r_entity]
];

const _rules2 = [
  ['balance_pairs', r_balance_pairs],
  ['strikethrough', r_strikethrough.postProcess],
  ['emphasis', r_emphasis.postProcess],
  ['fragments_join', r_fragments_join]
];

class ParserInline {
  ruler: any;
  ruler2: any;

  constructor() {
    this.ruler = new Ruler();

    for (let i = 0; i < _rules.length; i++) {
      this.ruler.push(_rules[i][0], _rules[i][1]);
    }

    this.ruler2 = new Ruler();

    for (let i = 0; i < _rules2.length; i++) {
      this.ruler2.push(_rules2[i][0], _rules2[i][1]);
    }
  }

  skipToken(state: any): void {
    const pos = state.pos;
    const rules = this.ruler.getRules('');
    const len = rules.length;
    const maxNesting = state.md.options.maxNesting;
    const cache = state.cache;

    if (typeof cache[pos] !== 'undefined') {
      state.pos = cache[pos];
      return;
    }

    let ok = false;

    if (state.level < maxNesting) {
      for (let i = 0; i < len; i++) {
        state.level++;
        ok = rules[i](state, true);
        state.level--;

        if (ok) {
          if (pos >= state.pos) { throw new Error("inline rule didn't increment state.pos"); }
          break;
        }
      }
    } else {
      state.pos = state.posMax;
    }

    if (!ok) { state.pos++; }
    cache[pos] = state.pos;
  }

  tokenize(state: any): void {
    const rules = this.ruler.getRules('');
    const len = rules.length;
    const end = state.posMax;
    const maxNesting = state.md.options.maxNesting;

    while (state.pos < end) {
      const prevPos = state.pos;
      let ok = false;

      if (state.level < maxNesting) {
        for (let i = 0; i < len; i++) {
          ok = rules[i](state, false);
          if (ok) {
            if (prevPos >= state.pos) { throw new Error("inline rule didn't increment state.pos"); }
            break;
          }
        }
      }

      if (ok) {
        if (state.pos >= end) { break; }
        continue;
      }

      state.pending += state.src[state.pos++];
    }

    if (state.pending) {
      state.pushPending();
    }
  }

  parse(str: string, md: any, env: any, outTokens: any[]): void {
    const state = new this.State(str, md, env, outTokens);

    this.tokenize(state);

    const rules = this.ruler2.getRules('');
    const len = rules.length;

    for (let i = 0; i < len; i++) {
      rules[i](state);
    }
  }

  State = StateInline;
}

export default ParserInline;
