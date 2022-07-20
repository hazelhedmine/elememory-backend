module.exports = {
  env: {
    node: true,
    commonjs: true,
    es2021: true,
    jest: true,
  },
  extends: 'eslint:recommended',
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    indent: ['error', 2],
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'single'],
    semi: ['error', 'never'],
    eqeqeq: 'error', // if equality is checked with anything other than ===
    'no-trailing-spaces': 'error',
    'object-curly-spacing': [
      // always a space before and after {}
      'error',
      'always',
    ],
    'arrow-spacing': [
      // consistent use of whitespace
      'error',
      { before: true, after: true },
    ],
    'no-console': 0, // disables console.log checking
  },
}
