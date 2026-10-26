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
        // `:::demo isolated` —— 该示例用 iframe 隔离渲染
        const isolated = /(^|\s)isolated(\s|$)/.test(rawInfo)
        const description = rawInfo.replace(/\s*\bisolated\b\s*/, ' ').trim()
        const sourceFileToken = tokens[idx + 2]
        let source = ''
        const sourceFile = sourceFileToken.children?.[0].content ?? ''
        if (sourceFileToken.type === 'inline') {
          source = fs.readFileSync(path.join(docRoot, 'examples', `${sourceFile}.vue`), 'utf-8')
        }

        if (!source) throw new Error(`Incorrect source file: ${sourceFile}`)

        return `<Demo${isolated ? ' isolated="true"' : ''}  source="${encodeURIComponent(
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
