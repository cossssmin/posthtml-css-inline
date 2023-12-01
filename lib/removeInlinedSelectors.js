const process = (node, sortedCssNodes, selectorsToRemove, options) => {
  const css = sortedCssNodes
  .filter(cssNode => !selectorsToRemove.has(cssNode.selector))
  .map(cssNode => cssNode.toString())
  .join(' ')

  node.content = [css]

  // Remove the <style> tag if it's empty
  if (options.removeEmptyStyleTags && css.trim() === '') {
    node.tag = false
  }

  return node
}

export default process
