<div align="center">
  <img width="150" height="150" alt="PostHTML" src="https://posthtml.github.io/posthtml/logo.svg">
  <h1>PostHTML Inline CSS</h1>
  <p>PostHTML plugin for inlining CSS to HTML style attributes</p>

  [![Version][npm-version-shield]][npm]
  [![Build][github-ci-shield]][github-ci]
  [![License][license-shield]][license]
  [![Downloads][npm-stats-shield]][npm-stats]
</div>

## About

This is a work in progress. It's not ready for production and has not been published yet.

TODO:

- [ ] Support `<link rel="stylesheet">` tags
- [ ] Support `@import` rules?
- [ ] Remove inlined classes from HTML elements?
- Juice-compatible API
  - [ ] `resolveCSSVariables`
  - [ ] `applyStyleTags`
  - [ ] `applyAttributesTableElements`
  - [ ] `applyHeightAttributes`
  - [ ] `applyWidthAttributes`

This plugin will inline CSS from `<style>` tags into HTML `style` attributes.

Use cases:

- HTML emails
- Embedding HTML in 3<sup>rd</sup> party websites

Given something like this:

```html
<style>
  div {
    color: red;
  }

  @media (max-width: 600px) {
    .text-sm {
      font-size: 16px;
    }
  }
</style>
<div class="text-sm">Test</div>
```

... it will output:

```html
<style>
  @media (max-width: 600px) {
    .text-sm {
      font-size: 16px;
    }
  }
</style>
<div class="text-sm" style="color: red;">Test</div>
```

## Install

```
$ npm i posthtml posthtml-inline-css
```

## Usage

To use the plugin, simply pass it to PostHTML:

```js
import posthtml from'posthtml'
import inlineCss from'posthtml-inline-css'

posthtml([
  inlineCss(options)
])
  .process('[your HTML]')
  .then(result => console.log(result.html))
```

## Options

You may pass an object with options to the plugin.

Here are all available options, with their default values:

```js
{
  preserveImportant: false,
  removeEmptyStyleTags: true,
}
```

### `preserveImportant`

Type: `boolean`\
Default: `false`

Whether to preserve `!important` in the inlined CSS value.

For example this:

```js
import posthtml from'posthtml'
import inlineCss from'posthtml-inline-css'

posthtml([
  inlineCss({
    preserveImportant: true
  })
])
  .process(`
    <style>
      .text-sm {
        font-size: 12px;
      }

      div {
        font-size: 14px !important;
      }
    </style>

    <p class="text-sm">small text</p>
  `)
  .then(result => result.html)
```

Result:

```html
<p class="text-sm" style="font-size: 14px !important">small text</p>
```

### `removeEmptyStyleTags`

Type: `boolean`\
Default: `true`

Whether to remove `<style>` tags that become empty after inlining.

By default, the plugin removes each CSS selector that was inlined, which may result in empty `<style></style>` tags. Setting this to `false` will keep those tags in the output.

```js
import posthtml from'posthtml'
import inlineCss from'posthtml-inline-css'

posthtml([
  inlineCss({
    removeEmptyStyleTags: false
  })
])
  .process(`
    <style>
      .text-sm {
        font-size: 12px;
      }
    </style>

    <p class="text-sm">small text</p>
  `)
  .then(result => result.html)
```

Result:

```html
<style></style>

<p class="text-sm" style="font-size: 12px">small text</p>
```

[npm]: https://www.npmjs.com/package/posthtml
[npm-version-shield]: https://img.shields.io/npm/v/posthtml.svg
[npm-stats]: http://npm-stat.com/charts.html?package=posthtml
[npm-stats-shield]: https://img.shields.io/npm/dt/posthtml.svg
[github-ci]: https://github.com/posthtml/posthtml-plugin-starter/actions/workflows/nodejs.yml
[github-ci-shield]: https://github.com/posthtml/posthtml-plugin-starter/actions/workflows/nodejs.yml/badge.svg
[license]: ./license
[license-shield]: https://img.shields.io/npm/l/posthtml.svg
