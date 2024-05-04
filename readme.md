<h1 align="center">
  rollup-plugin-tree-shakeable
</h1>

<div align="center">
  <a href="https://npmjs.org/package/rollup-plugin-tree-shakeable">
    <img src="https://badgen.net/npm/v/rollup-plugin-tree-shakeable" alt="version" />
  </a>
  <a href="https://github.com/TomerAberbach/rollup-plugin-tree-shakeable/actions">
    <img src="https://github.com/TomerAberbach/rollup-plugin-tree-shakeable/workflows/CI/badge.svg" alt="CI" />
  </a>
</div>

<div align="center">
  A Rollup plugin that automatically annotates your module as tree shakeable.
</div>

## Install

```sh
$ npm i rollup-plugin-tree-shakeable
```

## Usage

```js
import treeShakeable from 'rollup-plugin-tree-shakeable'

export default {
  input: `src/index.js`,
  output: {
    dir: `output`,
    format: `esm`,
  },
  plugins: [treeShakeable()],
}
```

## Why?

Imagine you have code similar to this:

**`src/index.js`**:

<!-- eslint-disable no-inline-comments -->

```js
const withLogging =
  fn =>
  (...args) => {
    console.log(`Started call!`)
    try {
      return fn(...args)
    } finally {
      console.log(`Finished call!`)
    }
  }

export const f1 = withLogging(/* ... */)
export const f2 = withLogging(/* ... */)
export const f3 = withLogging(/* ... */)
// ...
```

You might expect that if a user of your package writes
`import { f1 } from 'your-package'`, then bundlers will
[tree shake](https://developer.mozilla.org/en-US/docs/Glossary/Tree_shaking) and
omit `f1`, `f2`, etc. from the final bundle. Unfortunately, bundlers will
generally include _all_ of your package's code in this case
([yes, even if you set `"sideEffects": false` in your `package.json`](https://github.com/evanw/esbuild/issues/1241))
because the bundler cannot easily tell that `withLogging` is side-effect free.

This plugin solves the problem by automatically adding
[`@__PURE__` annotations](https://esbuild.github.io/api/#pure) to all top-level
expressions in your code that prevent tree-shaking, with the assumption that
your package is actually [pure](https://en.wikipedia.org/wiki/Pure_function),
but bundlers need a little convincing of that.

For example, for the code above, running it through this plugin would result in
the following code:

<!-- eslint-disable no-inline-comments -->

```js
const withLogging =
  fn =>
  (...args) => {
    console.log(`Started call!`)
    try {
      return fn(...args)
    } finally {
      console.log(`Finished call!`)
    }
  }

export const f1 = /* @__PURE__*/ withLogging(/* ... */)
export const f2 = /* @__PURE__*/ withLogging(/* ... */)
export const f3 = /* @__PURE__*/ withLogging(/* ... */)
// ...
```

And if a user of your package writes `import { f1 } from 'your-package'`, then
bundlers _will_ tree-shake and strip out all functions other than `f1` from the
final bundle.

> [!CAUTION] Only use this plugin if your package is actually tree-shakeable,
> meaning that each export would still function correctly if all the other
> exports were stripped out.
>
> This plugin does not give your package that property. It only _convinces_
> bundlers that this is the case.

## Contributing

Stars are always welcome!

For bugs and feature requests,
[please create an issue](https://github.com/TomerAberbach/rollup-plugin-tree-shakeable/issues/new).

For pull requests, please read the
[contributing guidelines](https://github.com/TomerAberbach/rollup-plugin-tree-shakeable/blob/main/contributing.md).

## License

[Apache License 2.0](https://github.com/TomerAberbach/rollup-plugin-tree-shakeable/blob/main/license)

This is not an official Google product.
