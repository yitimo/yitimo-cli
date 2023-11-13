const path = require('path')
const fs = require('fs')
const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const { rimraf } = require('rimraf')
const utils = require('./utils')
const buildWebpackConfig = require('./buildWebpackConfig')
const getPages = require('./getPages')

const appConfig = utils.getAppConfig()

const pages = getPages(appConfig.pagesDir)

module.exports = {
  build() {
    rimraf.sync(appConfig.outputDir)
    // utils.stashDist(appConfig.outputDir, 'drop')
    const config = buildWebpackConfig({ isProd: true, pages })
    const webpackInstance = webpack(config, (a, b) => {
      if (a || b.hasErrors()) {
        if (a) {
          console.warn('build failed', a.message)
          utils.stashDist(appConfig.outputDir, 'drop')
          process.exit(1)
          return
        }
        console.warn('build failed', b.toString())
        utils.stashDist(appConfig.outputDir, 'drop')
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
      console.log('\n')
      // TODO: support build some pages, then merge to exists
      // console.log('[production]output to dist')
      // utils.stashDist(appConfig.outputDir, 'merge')
      // console.log('[production]clean dist.temp')
      // utils.stashDist(appConfig.outputDir, 'drop')
    })
    webpackInstance.run(() => {
      // log sth when building :)
    })
  },
  serve() {
    const config = buildWebpackConfig({ isProd: false, pages })
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
