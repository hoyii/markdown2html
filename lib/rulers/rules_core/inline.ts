export default function inline (state) {
  const tokens = state.tokens

  // Parse inlines
  for (let i = 0, l = tokens.length; i < l; i++) {
    const tok = tokens[i]
    // console.log(tok)
    if (tok.type === 'inline') {
      state.md.inline.parse(tok.content, state.md, state.env, tok.children)
    }
  }
}
