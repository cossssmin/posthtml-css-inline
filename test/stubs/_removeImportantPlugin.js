const plugin = () => {
  return {
    postcssPlugin: 'postcss-remove-important',
    Declaration(decl) {
      if (decl.important) {
        decl.important = false
      }
    }
  }
}

plugin.postcss = true

export default plugin
