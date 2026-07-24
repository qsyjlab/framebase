/** @type {import('prettier').Options} */
export default {
  semi: false,
  singleQuote: true,
  trailingComma: 'none',
  endOfLine: 'auto',
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  arrowParens: 'avoid',
  bracketSpacing: true,
  overrides: [
    {
      files: '*.html',
      options: {
        parser: 'html'
      }
    }
  ]
}
