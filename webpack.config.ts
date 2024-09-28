import fs from 'node:fs/promises'
import path from 'node:path'
import slugify from '@sindresorhus/slugify'
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import type { Compiler, Configuration } from 'webpack'
import postcss from 'postcss'
import postcssInlineFonts from './build/inline-font'

class NoEmitJSPlugin {
  filename: string

  constructor(filename: string) {
    this.filename = filename
  }

  apply(compiler: Compiler) {
    compiler.hooks.done.tapPromise('NoEmitJS', async () => {
      // await fs.unlink(path.resolve(__dirname, 'dist/fonts.js'))
      await fs.unlink(path.resolve(__dirname, `dist/${this.filename}.js`))
    })
  }
}

const baseConfig: Configuration = {
  entry: {
    fonts: './font-entry.css',
  },
  output: {
    publicPath: 'auto',
    assetModuleFilename: (pathData) => {
      const { filename, contentHash } = pathData
      const ext = path.extname(filename || '')
      const name = path.basename(filename || '', ext).toLowerCase()
      return `fonts/${slugify(name)}.${contentHash?.slice(0, 8)}${ext}`
    },
  },
  module: {
    rules: [],
  },
  optimization: {
    minimizer: [new CssMinimizerPlugin()],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name].css',
    }),
  ],
  mode: 'production',
  cache: {
    type: 'filesystem',
  },
}

export default [
  {
    ...baseConfig,
    name: 'fonts',
    plugins: [...(baseConfig.plugins ?? []), new NoEmitJSPlugin('fonts')],
    output: {
      ...baseConfig.output,
      clean: true,
    },
    module: {
      rules: [
        {
          test: /\.css/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
            },
            {
              loader: 'css-loader',
            },
          ],
        },
        {
          test: /\.woff2?$/,
          type: 'asset/resource',
        },
      ],
    },
  },
  {
    ...baseConfig,
    name: 'preview-fonts',
    plugins: [...(baseConfig.plugins ?? []), new NoEmitJSPlugin('preview-fonts')],
    entry: {
      'preview-fonts': './preview-font-entry.css',
    },
    module: {
      rules: [
        {
          test: /\.css/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
            },
            {
              loader: 'css-loader',
            },
          ],
        },
        {
          test: /\.woff2?$/,
          type: 'asset/resource',
        },
      ],
    },
  },
  // due to webpack lack of resourceQuery for css, we need to use a different config to handle this
  {
    ...baseConfig,
    name: 'inline-fonts',
    entry: {
      'inline-fonts': './font-entry.css',
    },
    plugins: [...(baseConfig.plugins ?? []), new NoEmitJSPlugin('inline-fonts')],
    module: {
      rules: [
        {
          test: /\.css/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
            },
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                implementation: postcss,
                postcssOptions: {
                  plugins: [postcssInlineFonts],
                },
              },
            },
          ],
        },
        {
          test: /\.woff2?$/,
          type: 'asset/inline',
        },
      ],
    },
  },
]
