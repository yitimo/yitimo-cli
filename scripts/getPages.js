const fs = require('fs')
const path = require('path')

/**
 * @param {string} targetDir
 * @returns {Array<{name: string; filename: string; template: string; entry: string;}>} pages
 */
function main(targetDir) {
  const pagePath = targetDir
  const rs = []
  fs.readdirSync(pagePath).forEach((name) => {
    if (fs.lstatSync(path.resolve(pagePath, name)).isDirectory()) {
      const basePath = path.resolve(pagePath, name)
      let entryFile = ''
      let templateFile = ''
      if (fs.existsSync(path.resolve(basePath, 'index.ts'))) {
        entryFile = 'index.ts'
      } else if (fs.existsSync(path.resolve(basePath, 'index.tsx'))) {
        entryFile = 'index.tsx'
      } else if (fs.existsSync(path.resolve(basePath, 'index.vue'))) {
        entryFile = 'index.vue'
      } else if (fs.existsSync(path.resolve(basePath, 'index.js'))) {
        entryFile = 'index.js'
      }
      if (fs.existsSync(path.resolve(basePath, 'index.html'))) {
        templateFile = 'index.html'
      }
      /**
       * rs.push({
          name,
          entry: `./pages/${entryFile ? `${name}/${entryFile}` : 'defaultEntry.ts'}`,
          template: `./pages/${templateFile ? `${name}/${templateFile}` : 'defaultTemplate.html'}`,
      })
       */
      rs.push({
        name,
        filename: `${name}.html`,
        entry: entryFile ? path.resolve(basePath, entryFile) : path.resolve(pagePath, 'defaultEntry.ts'),
        template: templateFile ? path.resolve(basePath, templateFile) : path.resolve(pagePath, 'defaultTemplate.html'),
      })
    }
  })
  return rs
}

// const pages = main()

// console.log(pages.map((e) => e.name).join(','))

module.exports = main
