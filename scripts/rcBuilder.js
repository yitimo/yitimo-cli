const baseEslintRules = require('./baseEslintRules.json')
const baseStylelintRules = require('./baseStylelintRules.json')

module.exports = {
  /**
   * Generate babel rc config
   */
  buildeBabelRC() {
    return {
      presets: [
        '@babel/preset-env',
        '@babel/preset-react',
      ],
    }
  },
  /**
   * Generate eslint rc config
   * @param {{
   *  globalVars?: {[_: string]: 'readonly'},
   *  rules?: {[_: string]: any},
   *  importAlias?: any,
   *  extends?: string[],
   * }} options
   */
  buildEslintRC(options = {}) {
    return {
      env: {
        es2021: true, node: true, browser: true, jest: true,
      },
      extends: [
        'airbnb-base', 'plugin:import/recommended', 'plugin:react/recommended', 'plugin:react-hooks/recommended', 'plugin:vue/vue3-recommended',
        ...(options.extends || []),
      ],
      parserOptions: { ecmaVersion: 12, parser: '@typescript-eslint/parser', sourceType: 'module' },
      plugins: ['@typescript-eslint'],
      settings: {
        'import/resolver': { node: { extensions: ['.js', '.json', '.ts', '.jsx', '.tsx', '.vue'], alias: options.importAlias } },
        react: { version: 'detect' },
      },
      rules: { ...baseEslintRules, ...(options.rules || {}) },
      globals: { ...(options.globalVars || {}) },
    }
  },
  /**
   * Generate stylelint rc config
   * @param {{
   *  rules?: {[_: string]: any},
   *  extends?: string[],
   * }} options
   */
  buildStylelintRC(options = {}) {
    return {
      rules: { ...baseStylelintRules, ...(options.rules || {}) },
      extends: [
        'stylelint-config-standard', 'stylelint-config-standard-scss', 'stylelint-config-standard-less', 'stylelint-config-standard-vue',
        ...(options.extends || []),
      ],
    }
  },
  /**
   * Generate yclirc config with type hints:)
   * @param {object} config config to generate
   * @param {string} config.outputDir base dir to output dist
   * @param {string} config.pagesDir base dir to find pages
   * @param {string} config.publicDir base dir for public assets to merge to output dir
   */
  buildYcliRC(config) {
    const rs = {}
    rs.pagesDir = config.pagesDir || 'pages'
    rs.outputDir = config.outputDir || 'dist'
    rs.publicDir = config.publicDir || 'public'
    return rs
  },
}
