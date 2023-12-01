import defaultOptions from './defaultOptions.js'
import processLinkTags from './processLinkTags.js'
import processStyleTags from './processStyleTags.js'
import removeInlinedSelectors from './removeInlinedSelectors.js'

const plugin = (options = {}) => {
  return function (tree) {
    options = {...defaultOptions, ...options}
    const promises = []

    tree.walk(node => {
      // Process <style> tags
      if (node.tag === 'style' && node.content) {
        promises.push(
          processStyleTags(node, tree, options)
            .then(({node, sortedCssNodes, selectorsToRemove}) => removeInlinedSelectors(node, sortedCssNodes, selectorsToRemove, options))
        )
      }

      // Process <link> tags
      if (node.tag === 'link' && node.attrs?.rel === 'stylesheet' && node.attrs?.href && options.processLinkTags) {
        promises.push(
          processLinkTags(node)
            .then(({node}) => {
              processStyleTags(node, tree, options)
                .then(({node, sortedCssNodes, selectorsToRemove}) => removeInlinedSelectors(node, sortedCssNodes, selectorsToRemove, options))
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
