## 这是一个 markdown 转 html 的解析器，参照 markdown-it 设计

### 如何使用

#### npm 包导入

npm install @hoyii/markdown2html@latest

```javascript
import Markdown2Html from '@hoyii/markdown2html'

const markdown2html = new Markdown2Html()

console.log(markdown2html.render('# HelloWorld!'))
```

#### 源码运行

1. git clone https://github.com/hoyii/markdown2html.git

2. cd markdown2html

3. npm install && npm run build

```javascript
const Markdown2Html = require('../dist/cjs/index.js')

const markdown2html = new Markdown2Html()

console.log(markdown2html.render('# HelloWorld!'))
```
