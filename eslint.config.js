import eslintConfig from '@tomer/eslint-config'

export default [
  { ignores: [`test/fixtures`] },
  ...eslintConfig,
  { rules: { 'no-restricted-syntax': `off` } },
]
