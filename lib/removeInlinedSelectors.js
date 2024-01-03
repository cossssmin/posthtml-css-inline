import matchHelper from 'posthtml-match-helper'

const process = ({node, sortedCssNodes, selectorsToRemove, tree, options: pluginOptions}) => {
  if (!pluginOptions.removeInlinedSelectors) {
    return node
  }

  // Update the <style> tag content to include only the selectors that were not inlined
  const css = sortedCssNodes
    .filter(cssNode => !selectorsToRemove.has(cssNode.selector))
    .map(cssNode => cssNode.toString())
    .join(' ')

  node.content = [css]

  // Create array of selectors to preserve - mostly ones that are inside at-rules
  const selectorsToPreserve = new Set(sortedCssNodes
    .filter(cssNode => cssNode.type !== 'rule')
    .flatMap(cssNode => {
      if (cssNode.nodes) {
        return cssNode.nodes.map(node => node.selector)
      }

      return []
    }))

  // Find selectorsToRemove in HTML and remove them
  sortedCssNodes
    .filter(cssNode => selectorsToRemove.has(cssNode.selector) && !selectorsToPreserve.has(cssNode.selector))
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
