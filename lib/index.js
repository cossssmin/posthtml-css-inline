import postcss from 'postcss'
import safe from 'postcss-safe-parser'
import matchHelper from 'posthtml-match-helper'
import defaultOptions from './defaultOptions.js'
import {extendStyle, sortCssNodesBySpecificity} from './utils.js'

const plugin = (options = {}) => {
  return function (tree) {
    options = {...defaultOptions, ...options}
    const selectorsToRemove = new Set()

    tree.walk(node => {
      // Process <style> tags
      if (node.tag === 'style' && node.content) {
        const {result} = postcss().process(node.content.join(' '), {from: undefined, parser: safe})
        const sortedCssNodes = sortCssNodesBySpecificity(result.root.nodes)

        // Inline the CSS
        sortedCssNodes.forEach(cssNode => {
          tree.match(matchHelper(cssNode.selector), htmlNode => {
            extendStyle(htmlNode, cssNode, options)

            // Mark the selector for removal
            if (options.removeInlinedSelectors) {
              selectorsToRemove.add(cssNode.selector)
            }

            return htmlNode
          })
        })

        // Remove the inlined CSS selectors from the <style> tag
        // Only works with shallow selectors, for now:
        // https://github.com/posthtml/posthtml-match-helper/issues/5
        const css = sortedCssNodes
          .filter(cssNode => !selectorsToRemove.has(cssNode.selector))
          .map(cssNode => cssNode.toString())
          .join(' ')

        // Remove the <style> tag if it's empty
        if (options.removeEmptyStyleTags && css.trim() === '') {
          return false
        }

        node.content = [css]
      }

      return node
    })

    return tree
  }
}

export default plugin
