// @ts-check
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import _ from 'lodash'
import prettier from 'prettier'
import { fs, glob } from 'zx'

const __dirname = dirname(fileURLToPath(import.meta.url))

interface FontInfo {
  path: string
  group: string
  name: string
  variants: Set<string>
}

function fontToCss(font: FontInfo) {
  const srcPath = resolve(__dirname, '..')
  const path = font.path.replace(`${srcPath}/`, '')
  return `
  @font-face {
    font-display: swap;
    font-family: "${font.name}";
    src: url("./${path}") format("woff2");
    ${font.variants.has('Italic') ? 'font-style: italic;' : ''} ${
    font.variants.has('Bold') ? 'font-weight: 700;' : ''
  } ${font.variants.has('Black') ? 'font-weight: 900;' : ''} }
  `.trim()
}

async function main() {
  const fontPath = resolve(__dirname, '../fonts')
  const entries = await glob(join(fontPath, '**/*.woff2'))
  const regex = /^(?<group>\w+)\/(?<name>[^/]+)\/.*\[(?<variants>[\s\w]+)\]\.woff2$/
  const fonts: FontInfo[] = entries
    .map((entry) => {
      try {
        const p = entry.replace(`${fontPath}/`, '')
        const m = regex.exec(p)
        if (!m) {
          console.log(p)
          return null
        }
        const { group, name, variants = '' } = m.groups || {}
        return {
          path: entry,
          group,
          name,
          variants: new Set(variants.split(' ')),
        }
      } catch {
        return null
      }
    })
    .filter(Boolean) as FontInfo[]
  const css = await prettier.format(fonts.map((font) => fontToCss(font)).join('\n'), {
    parser: 'css',
    printWidth: 120,
    singleQuote: true,
  })
  await fs.writeFile(resolve(__dirname, '../fonts.css'), css)
  const fontList = _.mapValues(_.groupBy(fonts, 'group'), (groupedFonts) =>
    [...new Set(groupedFonts.map(({ name }) => name))].sort()
  )
  // ! hide the Hidden group
  Reflect.deleteProperty(fontList, 'Hidden')
  const js = `export const fontList = ${JSON.stringify(fontList)}`
  await fs.writeFile(
    resolve(__dirname, '../font-list.ts'),
    await prettier.format(js, { parser: 'babel', printWidth: 120, singleQuote: true })
  )

  await fs.writeFile(
    resolve(__dirname, '../packages/fonts-meta/src/font-list.ts'),
    await prettier.format(js, { parser: 'babel', printWidth: 120, singleQuote: true })
  )
}

main()
