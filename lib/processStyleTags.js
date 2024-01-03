import postcss from 'postcss'
import safe from 'postcss-safe-parser'
import matchHelper from 'posthtml-match-helper'
import { sortCssNodesBySpecificity } from './utils.js'
import { extendStyle } from './extendStyle.js'

const processStyleTags = (node, tree, options = {}) => {
  return new Promise((resolve, reject) => {
    const selectorsToRemove = new Set()

    const { postcss: { plugins, ...postcssOptions } } = options

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
          return tree.match(matchHelper(cssNode.selector), htmlNode => {
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
