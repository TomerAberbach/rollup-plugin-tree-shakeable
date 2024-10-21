import eslintConfig from 'tomer/eslint'

export default [
  { ignores: [`test/fixtures`] },
  ...eslintConfig,
  { rules: { 'no-restricted-syntax': `off` } },
]
