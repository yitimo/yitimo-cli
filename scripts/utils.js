const fs = require('fs')
const path = require('path')
const os = require('os')
const rimraf = require('rimraf')

function copyFile(file, location) {
  const parent = file.split('/').slice(0, -1).join('/')
  if (!fs.existsSync(parent)) {
    fs.mkdirSync(parent, { recursive: true })
  }
  fs.writeFileSync(file, fs.readFileSync(location))
}

module.exports = {
  getAppConfig() {
    try {
      let configPath = null
      if (fs.existsSync(path.resolve('appconfig.json'))) {
        configPath = require(path.resolve('appconfig.json'))
      } else if (fs.existsSync(path.resolve('.appconfigrc.js'))) {
        configPath = require(path.resolve('.appconfigrc.js'))
      }
      if (!configPath) {
        throw new Error('no app config found, please check is appconfig.json or .appconfigrc.js exists')
      }
      return configPath
    } catch (e) {
      throw new Error(`read app config failed: ${e.message || 'unknown error'}`)
    }
  },
  /**
   * @param {string|number} name
   */
  getCmdArg(name) {
    if (typeof name === 'number') {
      return process.argv[name + 1] || null
    }
    const arg = process.argv.find((e) => e.startsWith(`--${name}`))
    if (!arg) {
      return null
    }
    return arg === `--${name}` ? true : arg.substring(`--${name}=`.length)
  },
  /**
   * @returns {string} LAN ip
   */
  getLocalIP() {
    try {
      const ipList = Object.values(os.networkInterfaces()).reduce(
        (r, list) => r.concat(
          list.reduce(
            (rr, i) => rr.concat(
              (i.family === 'IPv4' && !i.internal && i.address) || []
            ),
            []
          )
        ),
        []
      )
      const mainIP = ipList.filter((e) => !e.startsWith('169.254'))
      if (mainIP.length) {
        return mainIP[0]
      }
      throw new Error('no ip found')
    } catch (e) {
      console.warn('[fire]getLocalIP', e.message)
      return '127.0.0.1'
    }
  },
  /**
   * stash/pop/drop dir
   * @param {*} targetDir
   * @param {'merge'|'clean'|'drop'} action
   */
  stashDist(dir, action, options = {}) {
    switch (action) {
      case 'merge':
        console.log('merge dir', `from ${path.resolve(`${dir}.temp`)} to ${path.resolve(dir)}`)
        mergeDir(path.resolve(`${dir}.temp`), path.resolve(dir))
        return
      case 'drop':
        console.log('drop dir', `from ${path.resolve(`${dir}.temp`)} to void`)
        rimraf.sync(path.resolve(`${dir}.temp`))
        return
      default:
        throw new Error(`未知的操作: ${action}`)
    }
  },
  mergeDir(src, dest) {
    const files = fs.readdirSync(src)
    files.forEach((file) => {
      const srcFile = `${src}/${file}`
      const destFile = `${dest}/${file}`
      const stats = fs.lstatSync(srcFile)
  
      if (stats.isDirectory()) {
        this.mergeDirs(srcFile, destFile)
        return
      }
      // console.log({srcFile, destFile}, 'conflict?', fs.existsSync(destFile))
      if (!fs.existsSync(destFile)) {
        copyFile(destFile, srcFile)
        return
      }
      copyFile(destFile, srcFile)
    })
  },
}
