import Ruler from '../ruler.js'
import StateCore from '../rulers/rules_core/state_core.js'

import r_normalize from '../rulers/rules_core/normalize.js'
import r_block from '../rulers/rules_core/block.js'
import r_inline from '../rulers/rules_core/inline.js'
import r_linkify from '../rulers/rules_core/linkify.js'
import r_replacements from '../rulers/rules_core/replacements.js'
import r_smartquotes from '../rulers/rules_core/smartquotes.js'
import r_text_join from '../rulers/rules_core/text_join.js'

const _rules: [string, Function][] = [
  ['normalize', r_normalize],
  ['block', r_block],
  ['inline', r_inline],
  ['linkify', r_linkify],
  ['replacements', r_replacements],
  ['smartquotes', r_smartquotes],
  // `text_join` finds `text_special` tokens (for escape sequences)
  // and joins them with the rest of the text
  ['text_join', r_text_join]
]

/**
 * Core class that executes top-level rules.
 */
class Core {
  ruler: any

  constructor() {
    // Initialize the ruler for rule management
    this.ruler = new Ruler()

    for (let i = 0; i < _rules.length; i++) {
      this.ruler.push(_rules[i][0], _rules[i][1])
    }
  }

  /**
   * Executes the core chain rules.
   *
   * @param state - The state to be processed.
   */
  process(state: any): void {
    const rules = this.ruler.getRules('')

    for (let i = 0, l = rules.length; i < l; i++) {
      rules[i](state)
    }
  }

  // Expose the StateCore for external usage
  State = StateCore
}

export default Core
