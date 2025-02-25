// 处理 *this* 和 _that_ 的强调标记
//

// 将每个标记符作为一个单独的文本标记插入，并将其添加到定界符列表中
//
function emphasis_tokenize (state, silent) {
  const start = state.pos  // 保存当前位置
  const marker = state.src.charCodeAt(start)  // 获取当前位置的字符编码

  if (silent) { return false }  // 如果是静默模式，直接返回 false，不进行处理

  // 检查当前位置字符是否为下划线 _ 或星号 *
  if (marker !== 0x5F /* _ */ && marker !== 0x2A /* * */) { return false }

  // 扫描定界符，确定定界符的长度和开闭状态
  const scanned = state.scanDelims(state.pos, marker === 0x2A)

  for (let i = 0; i < scanned.length; i++) {
    const token = state.push('text', '', 0)  // 创建一个新的文本标记
    token.content = String.fromCharCode(marker)  // 设置标记内容为当前字符

    state.delimiters.push({
      // 起始标记符的字符编码 (数字)。
      //
      marker,

      // 这些定界符系列的总长度。
      //
      length: scanned.length,

      // 此定界符对应的标记的位置。
      //
      token: state.tokens.length - 1,

      // 如果此定界符匹配为有效的开标记符，则 `end` 将等于其位置，否则为 `-1`。
      //
      end: -1,

      // 判断此定界符是否可以打开或关闭强调的布尔标志。
      //
      open: scanned.can_open,
      close: scanned.can_close
    })
  }

  state.pos += scanned.length  // 更新当前位置

  return true  // 返回 true 表示处理成功
}

function postProcess (state, delimiters) {
  const max = delimiters.length  // 获取定界符列表的最大长度

  for (let i = max - 1; i >= 0; i--) {  // 反向遍历定界符列表
    const startDelim = delimiters[i]  // 获取当前定界符

    if (startDelim.marker !== 0x5F/* _ */ && startDelim.marker !== 0x2A/* * */) {
      continue  // 如果不是 _ 或 *，直接跳过
    }

    // 只处理开头的标记符
    if (startDelim.end === -1) {
      continue  // 如果没有匹配的结束标记符，跳过
    }

    const endDelim = delimiters[startDelim.end]  // 获取对应的结束定界符

    // 如果前一个定界符具有相同的标记符并且与此标记符相邻，
    // 将它们合并为一个强强调定界符。
    //
    // `<em><em>whatever</em></em>` -> `<strong>whatever</strong>`
    //
    const isStrong = i > 0 &&
               delimiters[i - 1].end === startDelim.end + 1 &&
               // 检查前两个标记符是否匹配且相邻
               delimiters[i - 1].marker === startDelim.marker &&
               delimiters[i - 1].token === startDelim.token - 1 &&
               // 检查最后两个标记符是否相邻（我们可以安全地假设它们匹配）
               delimiters[startDelim.end + 1].token === endDelim.token + 1

    const ch = String.fromCharCode(startDelim.marker)  // 将标记符转换为字符

    const token_o   = state.tokens[startDelim.token]
    token_o.type    = isStrong ? 'strong_open' : 'em_open'  // 设置标记类型为强或强调开标记
    token_o.tag     = isStrong ? 'strong' : 'em'  // 设置标记标签为 strong 或 em
    token_o.nesting = 1  // 表示嵌套的开始
    token_o.markup  = isStrong ? ch + ch : ch  // 如果强强调，则重复标记符
    token_o.content = ''  // 清空内容

    const token_c   = state.tokens[endDelim.token]
    token_c.type    = isStrong ? 'strong_close' : 'em_close'  // 设置标记类型为强或强调闭标记
    token_c.tag     = isStrong ? 'strong' : 'em'  // 设置标记标签为 strong 或 em
    token_c.nesting = -1  // 表示嵌套的结束
    token_c.markup  = isStrong ? ch + ch : ch  // 如果强强调，则重复标记符
    token_c.content = ''  // 清空内容

    if (isStrong) {
      // 如果是强强调，清空相关标记的内容
      state.tokens[delimiters[i - 1].token].content = ''
      state.tokens[delimiters[startDelim.end + 1].token].content = ''
      i--  // 减少索引，以跳过这些已合并的定界符
    }
  }
}

// 遍历定界符列表并用标签替换文本标记
//
function emphasis_post_process (state) {
  const tokens_meta = state.tokens_meta  // 获取标记的元数据
  const max = state.tokens_meta.length  // 获取元数据的最大长度

  postProcess(state, state.delimiters)  // 处理主标记的定界符

  for (let curr = 0; curr < max; curr++) {  // 遍历所有标记元数据
    if (tokens_meta[curr] && tokens_meta[curr].delimiters) {
      postProcess(state, tokens_meta[curr].delimiters)  // 处理每个元数据中的定界符
    }
  }
}

export default {
  tokenize: emphasis_tokenize,  // 导出 tokenize 函数，用于标记强调符号
  postProcess: emphasis_post_process  // 导出 postProcess 函数，用于后续处理
}
