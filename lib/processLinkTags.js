import { ofetch } from 'ofetch'

const isLocalUrl = url => !url.startsWith('http') && !url.startsWith('//')

const processLinkTags = node => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!isLocalUrl(node.attrs.href)) {
        const css = await ofetch(node.attrs.href)
        node.content = [css]
      } else {
        const { promises: fs } = await import('node:fs')
        const css = await fs.readFile(node.attrs.href, 'utf8')
        node.content = [css]
      }

      node.tag = 'style'
      node.attrs = {}

      resolve({
        node: node,
      })
    } catch (error) {
      reject(error)
    }
  })
}

export default processLinkTags
