import defaultOptions from './defaultOptions.js'
import processLinkTags from './processLinkTags.js'
import processStyleTags from './processStyleTags.js'
import removeInlinedSelectors from './removeInlinedSelectors.js'

const plugin = (options = {}) => {
  return function (tree) {
    options = {...defaultOptions, ...options}
    const promises = []
    const skipAttributes = new Set(['no-inline', 'data-embed', 'embed', 'prevent-inline', 'skip-inline'])

    tree.walk(node => {
      // Don't inline if node is marked as such
      if (
        ['style', 'link'].includes(node.tag)
        && node.attrs
        && Object.keys(node.attrs).some(attr => skipAttributes.has(attr))
      ) {
        // Delete node attribute
        for (const attr in node.attrs) {
          if (skipAttributes.has(attr)) {
            delete node.attrs[attr]
          }
        }

        return node
      }

      // Process <style> tags
      if (node.tag === 'style' && node.content) {
        promises.push(
          processStyleTags(node, tree, options)
            .then(({node, sortedCssNodes, selectorsToRemove}) => removeInlinedSelectors({node, sortedCssNodes, selectorsToRemove, tree, options}))
        )
      }

      // Process <link> tags
      if (node.tag === 'link' && node.attrs?.rel === 'stylesheet' && node.attrs?.href && options.processLinkTags) {
        promises.push(
          processLinkTags(node)
            .then(({node}) => {
              processStyleTags(node, tree, options)
                .then(({node, sortedCssNodes, selectorsToRemove}) => removeInlinedSelectors({node, sortedCssNodes, selectorsToRemove, tree, options}))
            })
        )
      }

      return node
    })

    return Promise.all(promises).then(() => {
      return tree
    })
  }
}

export default plugin
