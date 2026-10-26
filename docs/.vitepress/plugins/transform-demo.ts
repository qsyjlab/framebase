import MarkdownIt from 'markdown-it'
import mdContainer from 'markdown-it-container'
import path from 'path'
import fs from 'fs'
import { highlight } from '../utils/highlight'
import { docsRoot } from '../utils/path'

const docRoot = docsRoot

const localMd = MarkdownIt()

export function transformDemo(md: MarkdownIt) {
  md.use(mdContainer, 'demo', {
    validate(params) {
      return !!params.trim().match(/^demo\s*(.*)$/)
    },

    render(tokens, idx) {
      const m = tokens[idx].info.trim().match(/^demo\s*(.*)$/)
      if (tokens[idx].nesting === 1) {
        const rawInfo = m && m.length > 1 ? m[1].trim() : ''
        // 默认渲染成 iframe，彻底隔离 VitePress 样式；
        // `:::demo inline` 退回内联渲染（依赖 .vp-raw 重置），仅用于必须跟随页面排版的示例。
        const inline = /(^|\s)inline(\s|$)/.test(rawInfo)
        const description = rawInfo
          .replace(/\s*\binline\b\s*/, ' ')
          .replace(/\s*\bisolated\b\s*/, ' ')
          .trim()
        const sourceFileToken = tokens[idx + 2]
        let source = ''
        const sourceFile = sourceFileToken.children?.[0].content ?? ''
        if (sourceFileToken.type === 'inline') {
          source = fs.readFileSync(path.join(docRoot, 'examples', `${sourceFile}.vue`), 'utf-8')
        }

        if (!source) throw new Error(`Incorrect source file: ${sourceFile}`)

        return `<Demo${inline ? ' inline="true"' : ''}  source="${encodeURIComponent(
          highlight(source, 'vue')
        )}" path="${sourceFile}" raw-source="${encodeURIComponent(
          source
        )}" description="${encodeURIComponent(localMd.render(description))}">`
      } else {
        return '</Demo>'
      }
    }
  })
}
