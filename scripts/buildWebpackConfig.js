const path = require('path')
const fs = require('fs')
const webpackMerge = require('webpack-merge').merge
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const EslintWebpackPlugin = require('eslint-webpack-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const { VueLoaderPlugin } = require('vue-loader')
const utils = require('./utils')

const appConfig = utils.getAppConfig()

function generateBaseConfig(options) {
  const {
    isProd,
    pages,
  } = options
  /** @type {import('webpack').Configuration} */
  const baseConfig = {
    target: 'web',
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json', '.vue'],
      modules: ['node_modules'],
    },
    output: {
      path: path.resolve(appConfig.outputDir),
      hashDigestLength: 8,
    },
    entry: {
      ...pages.reduce((r, n) => ({ ...r, [n.name]: n.entry }), {}),
    },
    module: {
      rules: [
        {
          test: /\.(js(x?))$/,
          use: [
            { loader: 'babel-loader' },
          ],
          exclude: /node_modules/,
        },
        {
          test: /\.ts(x?)$/,
          exclude: /node_modules/,
          use: [
            { loader: 'babel-loader' },
            { loader: 'ts-loader', options: { appendTsSuffixTo: [/\.vue$/] } },
          ],
        },
        {
          test: /\.vue$/,
          use: [
            { loader: 'vue-loader', options: { compilerOptions: { preserveWhitespace: false } } },
          ],
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: [
            isProd ? MiniCssExtractPlugin.loader : 'style-loader',
            { loader: 'css-loader', options: { url: false } },
            { loader: 'postcss-loader' },
          ],
          exclude: /\.module\.css$/,
        },
        {
          test: /\.module\.css$/,
          use: [
            isProd ? MiniCssExtractPlugin.loader : 'style-loader',
            { loader: 'css-loader', options: { url: false, modules: true } },
            { loader: 'postcss-loader' },
          ],
        },
        {
          test: /\.less$/,
          use: [
            isProd ? MiniCssExtractPlugin.loader : 'style-loader',
            { loader: 'css-loader', options: { url: false } },
            { loader: 'postcss-loader' },
            { loader: 'less-loader' },
          ],
          exclude: /\.module\.less$/,
        },
        {
          test: /\.module\.(css|less)$/,
          use: [
            isProd ? MiniCssExtractPlugin.loader : 'style-loader',
            { loader: 'css-loader', options: { url: false, modules: true } },
            { loader: 'postcss-loader' },
            { loader: 'less-loader' },
          ],
        },
        {
          test: /\.scss$/,
          use: [
            isProd ? MiniCssExtractPlugin.loader : 'style-loader',
            { loader: 'css-loader', options: { url: false } },
            { loader: 'postcss-loader' },
            { loader: 'sass-loader' },
          ],
          exclude: /\.module\.scss$/,
        },
        {
          test: /\.module\.scss$/,
          use: [
            isProd ? MiniCssExtractPlugin.loader : 'style-loader',
            { loader: 'css-loader', options: { url: false, modules: true } },
            { loader: 'postcss-loader' },
            { loader: 'sass-loader' },
          ],
        },
      ],
    },
    plugins: [
      ...pages.map((page) => new HtmlWebpackPlugin({
        template: page.template,
        filename: page.name === 'index' ? 'index.html' : `${page.name}/index.html`,
        chunks: [page.name],
        minify: false,
        inject: 'body',
      })),
      new EslintWebpackPlugin(),
      new VueLoaderPlugin(),
      ...(fs.existsSync(path.resolve(appConfig.publicDir)) ? [new CopyWebpackPlugin({
        patterns: [
          {
            from: path.resolve(appConfig.publicDir),
            to: '.',
            filter(name) {
              if (name.endsWith('.gitkeep')) {
                return false
              }
              return true
            },
          },
        ],
      })] : []),
    ],
  }
  return baseConfig
}

function generateDevConfig() {
  const devConfig = {
    mode: 'development',
    devtool: 'inline-source-map',
    output: {
      filename: '[name]/js/[name].js',
      chunkFilename: '[name]/js/[name].js',
    },
    plugins: [],
  }
  return devConfig
}

function generateProdConfig() {
  const prodConfig = {
    mode: 'production',
    devtool: 'source-map',
    output: {
      filename: '[name]/js/[name].[contenthash].js',
      chunkFilename: '[name]/js/[name].[contenthash].js',
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: '[name]/css/[name].[contenthash].css',
        chunkFilename: '[name]/css/[name].[contenthash].css',
      }),
    ],
    optimization: {
      minimize: true,
      minimizer: [new CssMinimizerPlugin()],
      splitChunks: {
        cacheGroups: {
          defaultVendors: false,
          default: false,
        },
      },
    },
  }
  return prodConfig
}

module.exports = (options) => {
  const config = webpackMerge(generateBaseConfig(options), options.isProd ? generateProdConfig(options) : generateDevConfig(options))
  return config
}
