import matchHelper from 'posthtml-match-helper'

const process = ({node, sortedCssNodes, inlinedSelectors, tree, options: pluginOptions}) => {
  if (!pluginOptions.removeInlinedSelectors) {
    return node
  }

  // Create array of selectors to preserve - mostly ones that are inside at-rules
  const selectorsToPreserve = new Set(sortedCssNodes
    .filter(cssNode => cssNode.type !== 'rule' && !inlinedSelectors.has(cssNode.selector))
    .flatMap(cssNode => {
      if (cssNode.nodes) {
        return cssNode.nodes.map(node => node.selector)
      }

      return []
    }))

  // Create a list of orphans (selectors that have not been inlined)
  const orphanedSelectors = new Set(sortedCssNodes
    .filter(cssNode => cssNode.type !== 'atrule')
    .filter(cssNode => !inlinedSelectors.has(cssNode.selector))
    .map(cssNode => cssNode.selector)
    .filter(Boolean))

  // Update the <style> tag content to exclude inlined and orphaned selectors
  const css = sortedCssNodes
    .filter(cssNode => !orphanedSelectors.has(cssNode.selector))
    .map(cssNode => cssNode.toString())
    .join(' ')

  node.content = [css]

  // Find inlinedSelectors in HTML and remove them
  sortedCssNodes
    .filter(cssNode => inlinedSelectors.has(cssNode.selector) && !selectorsToPreserve.has(cssNode.selector))
    .map(cssNode => {
      tree.match(matchHelper(cssNode.selector), htmlNode => {
        // Remove cssNode.selector from htmlNode attrs
        if (htmlNode.attrs?.class) {
          htmlNode.attrs.class = htmlNode.attrs.class
            .split(' ')
            .filter(className => !cssNode.selector.includes(className))
            // Removes empty class="" attributes with `false`
            .join(' ') || false
        }

        return htmlNode
      })

      return cssNode
    })

  // Remove the <style> tag if it's empty
  if (css.trim() === '') {
    node.tag = false
  }

  return node
}

export default process
