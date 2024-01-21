import parseAttrs from 'posthtml-attrs-parser'

export function extendStyle(htmlNode, cssNode, options = {}) {
  const attrs = parseAttrs(htmlNode.attrs)
  const parsedCssNode = parseCssFromNode(cssNode)

  attrs.style = attrs.style || {}

  for (const property in parsedCssNode) {
    // Don't inline `excludedProperties`
    if (options.excludedProperties?.includes(property)) continue

    if (Object.prototype.hasOwnProperty.call(parsedCssNode, property)) {
      const cssValue = parsedCssNode[property]

      if (cssValue.includes('!important')) {
        // Keep or discard the `!important` value in the inlined CSS based on the `preserveImportant` option
        attrs.style[property] = options.preserveImportant ? cssValue : cssValue.replace(' !important', '')
      } else {
        // Only add the CSS value if it doesn't already exist inline
        attrs.style[property] ||= cssValue
      }
    }
  }

  htmlNode.attrs = attrs.compose()

  // Fix issue with .compose() automatically quoting attributes with no values
  Object.entries(htmlNode.attrs).forEach(([name, value]) => {
    if (value === '' && options.recognizeNoValueAttribute === true) {
      htmlNode.attrs[name] = true
    }
  })

  return htmlNode
}

function parseCssFromNode(cssNode) {
  const css = {}
  cssNode.nodes.forEach(node => {
    css[node.prop] = node.value + (node.important ? ' !important' : '')
  })

  return css
}
