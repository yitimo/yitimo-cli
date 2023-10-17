#!/usr/bin/env node

const utils = require('../scripts/utils')
const webpacker = require('../scripts/webpacker')

// const appConfig = utils.getAppConfig()
// const pages = (utils.getCmdArg('pages') || '').split(',').filter((e) => !!e)
const cmd = utils.getCmdArg(1)

main(cmd)

function main(action) {
  switch (action) {
    case 'build':
      webpacker.build()
      return
    case 'serve':
      webpacker.serve()
      return
    case 'test':
    default:
      console.error(`Unsupported action: ${cmd}`)
      process.exit(1)
  }
}
