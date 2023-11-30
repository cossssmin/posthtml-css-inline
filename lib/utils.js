import {calculate, compareDesc} from 'specificity'
import parseAttrs from 'posthtml-attrs-parser'

export function extendStyle(htmlNode, cssNode, options = {}) {
  const attrs = parseAttrs(htmlNode.attrs)
  const cssNodeCss = parseCssFromNode(cssNode)

  attrs.style = {...cssNodeCss, ...attrs.style}

  // Check if any cssNode styles have `!important`
  for (const property in cssNodeCss) {
    if (Object.prototype.hasOwnProperty.call(cssNodeCss, property)) {
      const cssValue = cssNodeCss[property]

      if (cssValue.includes('!important')) {
        // Keep or discard the `!important` value in the inlined CSS based on the `preserveImportant` option
        attrs.style[property] = options.preserveImportant ? cssValue : cssValue.replace(' !important', '')
      }
    }
  }

  htmlNode.attrs = attrs.compose()

  // Fix issue with .compose() automatically quoting attributes with no values
  Object.entries(htmlNode.attrs).forEach(([name, value]) => {
    if (value === '' && options.posthtml?.recognizeNoValueAttribute === true) {
      htmlNode.attrs[name] = true
    }
  })

  return htmlNode
}

export function sortCssNodesBySpecificity(nodes) {
  return nodes.sort((a, b) => {
    const specificityA = typeof a.selector === 'string' ? calculate(a.selector) : {A: 0, B: 0, C: 0}
    const specificityB = typeof b.selector === 'string' ? calculate(b.selector) : {A: 0, B: 0, C: 0}

    return compareDesc(specificityA, specificityB)
  })
}

function parseCssFromNode(cssNode) {
  const css = {}
  cssNode.nodes.forEach(node => {
    css[node.prop] = node.value + (node.important ? ' !important' : '')
  })

  return css
}
