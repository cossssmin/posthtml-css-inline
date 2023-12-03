import { ofetch } from 'ofetch'

const isLocalUrl = url => !url.startsWith('http') && !url.startsWith('//')

const processLinkTags = node => {
  return new Promise(async (resolve, reject) => { // eslint-disable-line
    try {
      if (isLocalUrl(node.attrs.href)) {
        const { promises: fs } = await import('node:fs')
        const css = await fs.readFile(node.attrs.href, 'utf8')
        node.content = [css]
      } else {
        const css = await ofetch(node.attrs.href)
        node.content = [css]
      }

      node.tag = 'style'
      node.attrs = {}

      resolve({node})
    } catch (error) {
      reject(error)
    }
  })
}

export default processLinkTags
