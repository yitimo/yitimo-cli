const { buildYcliRC } = require('./scripts/rcBuilder')

module.exports = buildYcliRC({
  pagesDir: 'demo/pages',
  outputDir: 'demo/dist',
  publicDir: 'demo/public',
})
