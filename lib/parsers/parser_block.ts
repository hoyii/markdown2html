import Ruler from '../ruler.js'
import StateBlock from '../rulers/rules_block/state_block.js'

import r_table from '../rulers/rules_block/table.js'
import r_code from '../rulers/rules_block/code.js'
import r_fence from '../rulers/rules_block/fence.js'
import r_blockquote from '../rulers/rules_block/blockquote.js'
import r_hr from '../rulers/rules_block/hr.js'
import r_list from '../rulers/rules_block/list.js'
import r_reference from '../rulers/rules_block/reference.js'
import r_html_block from '../rulers/rules_block/html_block.js'
import r_heading from '../rulers/rules_block/heading.js'
import r_lheading from '../rulers/rules_block/lheading.js'
import r_paragraph from '../rulers/rules_block/paragraph.js'

// Define types for state and token structures
interface State {
  md: any;
  line: number;
  lineMax: number;
  level: number;
  blkIndent: number;
  sCount: number[];
  tight: boolean;
  tokens: any[];
  isEmpty: (lineIndex: number) => boolean;
  skipEmptyLines: (lineIndex: number) => number;
}

interface Rule {
  (state: State, line: number, endLine: number, inParagraph: boolean): boolean;
}

// Rules configuration
const _rules: [string, Rule, string[]?][] = [
  ['table', r_table, ['paragraph', 'reference']],
  ['code', r_code],
  ['fence', r_fence, ['paragraph', 'reference', 'blockquote', 'list']],
  ['blockquote', r_blockquote, ['paragraph', 'reference', 'blockquote', 'list']],
  ['hr', r_hr, ['paragraph', 'reference', 'blockquote', 'list']],
  ['list', r_list, ['paragraph', 'reference', 'blockquote']],
  ['reference', r_reference],
  ['html_block', r_html_block as any, ['paragraph', 'reference', 'blockquote']],
  ['heading', r_heading, ['paragraph', 'reference', 'blockquote']],
  ['lheading', r_lheading],
  ['paragraph', r_paragraph]
];

class ParserBlock {
  ruler: any;

  constructor() {
    this.ruler = new Ruler();

    for (let i = 0; i < _rules.length; i++) {
      this.ruler.push(_rules[i][0], _rules[i][1], { alt: (_rules[i][2] || []).slice() });
    }
  }

  // Generate tokens for input range
  tokenize(state: State, startLine: number, endLine: number): void {
    const rules = this.ruler.getRules('');
    const len = rules.length;
    const maxNesting = state.md.options.maxNesting;
    let line = startLine;
    let hasEmptyLines = false;

    while (line < endLine) {
      state.line = line = state.skipEmptyLines(line);
      if (line >= endLine) { break; }

      // Termination condition for nested calls
      if (state.sCount[line] < state.blkIndent) { break; }

      // If nesting level exceeded - skip tail to the end
      if (state.level >= maxNesting) {
        state.line = endLine;
        break;
      }

      // Try all possible rules
      const prevLine = state.line;
      let ok = false;

      for (let i = 0; i < len; i++) {
        ok = rules[i](state, line, endLine, false);
        if (ok) {
          if (prevLine >= state.line) {
            throw new Error("block rule didn't increment state.line");
          }
          break;
        }
      }

      if (!ok) throw new Error('none of the block rules matched');

      // Set state.tight if we had an empty line before the current tag
      state.tight = !hasEmptyLines;

      // Paragraph might "eat" one newline after it in nested lists
      if (state.isEmpty(state.line - 1)) {
        hasEmptyLines = true;
      }

      line = state.line;

      if (line < endLine && state.isEmpty(line)) {
        hasEmptyLines = true;
        line++;
        state.line = line;
      }
    }
  }

  // Process input string and push block tokens into outTokens
  parse(src: string, md: any, env: any, outTokens: any[]): void {
    if (!src) { return; }

    const state = new this.State(src, md, env, outTokens);

    this.tokenize(state, state.line, state.lineMax);
  }

  // State class based on StateBlock
  State = StateBlock;
}

export default ParserBlock;
