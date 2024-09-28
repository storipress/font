const processed = Symbol('inline-font-processed')

module.exports = () => {
  return {
    postcssPlugin: 'inline-font',
    prepare() {
      return {
        Declaration: {
          src: (decl) => {
            if (decl[processed]) {
              return
            }

            if (decl.parent?.type !== 'atrule' || decl.parent.name !== 'font-face') {
              decl[processed] = true
              return
            }

            const font = decl.value.split(',').find((line) => line.includes('woff2'))
            decl.value = font.replace(/url\('(.*?)'\)/, "url('$1?inline')")
            decl[processed] = true
          },
        },
        Rule: (rule) => {
          rule.remove()
        },
      }
    },
  }
}

module.exports.postcss = true
