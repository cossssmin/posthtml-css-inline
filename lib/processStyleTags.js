import postcss from 'postcss'
import safe from 'postcss-safe-parser'
import matchHelper from 'posthtml-match-helper'
import { sortCssNodesBySpecificity } from './utils.js'
import { extendStyle } from './extendStyle.js'

const processStyleTags = (node, tree, options = {}) => {
  return new Promise((resolve, reject) => {
    try {
      const selectorsToRemove = new Set()

      const { result } = postcss().process(node.content.join(' '), {
        from: undefined,
        parser: safe,
      })

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

      resolve({
        node,
        sortedCssNodes,
        selectorsToRemove,
      })
    } catch (error) {
      reject(error)
    }
  })
}

export default processStyleTags
