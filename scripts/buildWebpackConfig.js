const path = require('path')
const webpackMerge = require('webpack-merge').merge
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const EslintWebpackPlugin = require('eslint-webpack-plugin')
const { VueLoaderPlugin } = require('vue-loader')

const projDir = path.resolve('.')

/** @type {import('webpack').Configuration} */
const baseConfig = {
  target: 'web',
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json', '.vue'],
    modules: ['node_modules'],
  },
  output: {
    path: path.resolve(projDir, 'dist'),
    hashDigestLength: 8,
  },
  entry: {
    global: path.resolve(projDir, 'pages/global.ts'),
    ...pages.reduce((r, n) => ({ ...r, [n.name]: n.entry }), {}),
  },
  module: {
    rules: [
      {
        test: /\.(js(x?))$/,
        use: [{
          loader: 'babel-loader',
        }],
        exclude: /node_modules/,
      },
      {
        test: /\.ts(x?)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
          },
          {
            loader: 'ts-loader',
            options: {
              appendTsSuffixTo: [/\.vue$/],
            },
          },
        ],
      },
      {
        test: /\.vue$/,
        use: [{
          loader: 'vue-loader',
          options: {
            compilerOptions: {
              preserveWhitespace: false,
            },
          },
        }],
        exclude: /node_modules/,
      },
      {
        test: /\.(css|less)$/,
        use: [
          isProd ? MiniCssExtractPlugin.loader : 'style-loader',
          {
            loader: 'css-loader',
            options: {
              url: false,
            },
          },
          {
            loader: 'postcss-loader',
          },
          {
            loader: 'less-loader',
          },
        ],
        exclude: /\.module\.less$/,
      },
      {
        test: /\.module\.(css|less)$/,
        use: [
          isProd ? MiniCssExtractPlugin.loader : 'style-loader',
          {
            loader: 'css-loader',
            options: {
              url: false,
              modules: true,
            },
          },
          {
            loader: 'postcss-loader',
          },
          {
            loader: 'less-loader',
          },
        ],
      },
    ],
  },
  plugins: [
    ...pages.map((page) => new HtmlWebpackPlugin({
      template: page.template,
      filename: page.filename,
      chunks: ['global', page.name],
      minify: false,
      inject: 'body',
    })),
    new EslintWebpackPlugin(),
    new VueLoaderPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(projDir, 'public'),
          to: 'static',
          filter(name) {
            if (name.endsWith('.gitkeep')) {
              return false
            }
            return true
          },
        },
      ],
    }),
  ],
}

const devConfig = {
  mode: 'development',
  devtool: 'inline-source-map',
  output: {
    filename: 'static/js/[name].js',
    chunkFilename: 'static/js/[name].js',
  },
  plugins: [],
  devServer: {
    static: {
      publicPath: '/',
    },
    hot: true,
    open: true,
    allowedHosts: 'all',
    // host: '0.0.0.0',
    port: 3000,
  },
}

const prodConfig = {
  mode: 'production',
  devtool: 'source-map',
  output: {
    filename: 'static/js/[name].[contenthash].js',
    chunkFilename: 'static/js/[name].[contenthash].js',
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'static/css/[name].[contenthash].css',
      chunkFilename: 'static/css/[name].[contenthash].css',
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

module.exports = function(isProd) {
  return webpackMerge(baseConfig, isProd ? prodConfig : devConfig)
}
