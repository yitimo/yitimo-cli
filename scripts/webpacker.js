const path = require('path')
const fs = require('fs')
const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const utils = require('./utils')
const buildWebpackConfig = require('./buildWebpackConfig')
const getPages = require('./getPages')

const pages = getPages('pages')
const pagePath = 'pages'

module.exports = {
  build() {
    utils.stashDist('dist', 'drop')
    const config = buildWebpackConfig({ isProd: true, pages, pagePath })
    const webpackInstance = webpack(config, (a, b) => {
      if (a || b.hasErrors()) {
        if (a) {
          console.warn('build failed', a.message)
          utils.stashDist('dist', 'drop')
          process.exit(1)
          return
        }
        console.warn('build failed', b.toString())
        utils.stashDist('dist', 'drop')
        process.exit(1)
      }
    })
    webpackInstance.hooks.beforeCompile.tap('Compile', () => {
      process.stdout.write('\r\x1b[K')
      process.stdout.write('[production]Compiling...')
    })
    webpackInstance.hooks.afterDone.tap('Compile', () => {
      process.stdout.write('\r\x1b[K')
      process.stdout.write('[production]Compile finished')
      console.log('[production]output to dist')
      utils.stashDist('dist', 'merge')
      console.log('[production]clean dist.temp')
      utils.stashDist('dist', 'drop')
    })
    webpackInstance.run(() => {
      // log sth when building :)
    })
  },
  serve() {
    const config = buildWebpackConfig({ isProd: false, pages, pagePath })
    const webpackInstance = webpack(config)
    webpackInstance.hooks.beforeCompile.tap('Compile', () => {
      process.stdout.write('\r\x1b[K')
      process.stdout.write('[development]Compiling...')
    })
    webpackInstance.hooks.afterCompile.tap('Compile', () => {
      process.stdout.write('\r\x1b[K')
      process.stdout.write('[development]Compile finished')
    })
    const localIP = utils.getLocalIP()
    const port = 3000
    const devServer = new WebpackDevServer(webpackInstance, {
      static: {
        directory: (fs.existsSync(path.resolve('public')) && fs.readdirSync(path.resolve('public')).length) ? path.resolve('public') : undefined,
        publicPath: '/',
      },
      hot: true,
      allowedHosts: 'all',
      port,
    })
    devServer.listen(port, '0.0.0.0', () => {
      console.log('dev server is on!', `http://${localIP}:${port}`)
    })
  },
}
