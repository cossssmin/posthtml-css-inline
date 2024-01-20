import postcss from 'postcss'
import safe from 'postcss-safe-parser'
import matchHelper from 'posthtml-match-helper'
import { sortCssNodesBySpecificity } from './utils.js'
import { extendStyle } from './extendStyle.js'

const processStyleTags = (node, tree, options = {}) => {
  return new Promise((resolve, reject) => {
    const selectorsToRemove = new Set()

    const { postcss: { plugins, ...postcssOptions } } = options
    const safelist = options.safelist || []
    const skipAttributes = new Set(['no-inline', 'prevent-inline', 'skip-inline'])

    // Ensure node.content is array
    node.content = Array.isArray(node.content) ? node.content : [node.content]

    postcss(plugins || [])
      .process(node.content.join(' '), {
        from: undefined,
        parser: safe,
        ...postcssOptions,
      })
      .then(result => {
        const sortedCssNodes = sortCssNodesBySpecificity(result.root.nodes)

        sortedCssNodes.map(cssNode => {
          if (safelist.includes(cssNode.selector)) {
            return
          }

          return tree.match(matchHelper(cssNode.selector), htmlNode => {
            // Don't inline if node is marked as such
            if (
              htmlNode.attrs
              && Object.keys(htmlNode.attrs).some(attr => skipAttributes.has(attr))
            ) {
              // Delete node attribute
              for (const attr in htmlNode.attrs) {
                if (skipAttributes.has(attr)) {
                  delete htmlNode.attrs[attr]
                }
              }

              return htmlNode
            }

            extendStyle(htmlNode, cssNode, options)

            if (options.removeInlinedSelectors) {
              selectorsToRemove.add(cssNode.selector)
            }

            return htmlNode
          })
        })

        node.content = [result.root.toString()]

        resolve({
          node,
          sortedCssNodes,
          selectorsToRemove,
        })
      })
      .catch(error => {
        reject(error)
      })
  })
}

export default processStyleTags
