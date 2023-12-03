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

- [x] Support `<link rel="stylesheet">` tags
- [ ] Support `@import` rules?
- [ ] Remove inlined classes from HTML elements?
- [ ] Support PostCSS plugins
- [ ] Juice-compatible options
  - [ ] `resolveCSSVariables`
  - [ ] `applyHeightAttributes`
  - [ ] `applyWidthAttributes`
  - [ ] `applyAttributesTableElements`

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
  processLinkTags: false,
  preserveImportant: false,
  removeInlinedSelectors: false,
}
```

### `processLinkTags`

Type: `boolean`\
Default: `false`

Whether to process `<link rel="stylesheet">` tags.

The plugin will fetch the CSS from the URL in the `href` attribute, and replace the `<link>` tag with a `<style>` tag containing the CSS. This `<style>` tag will then be inlined into the HTML.

```js
import posthtml from'posthtml'
import inlineCss from'posthtml-inline-css'

posthtml([
  inlineCss({
    processLinkTags: true
  })
])
  .process(`
    <link rel="stylesheet" href="public/styles.css">

    <p class="text-sm">small text</p>
  `)
  .then(result => result.html)
```

```css
/* public/styles.css */
.text-sm {
  font-size: 12px;
}
```

Result:

```html
<p class="text-sm" style="font-size: 12px">small text</p>
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

... will output this:

```html
<p class="text-sm" style="font-size: 14px !important">small text</p>
```

### `removeInlinedSelectors`

Type: `boolean`\
Default: `false`

Whether to remove selectors that were successfully inlined from the `<style>` tag.

```js
import posthtml from'posthtml'
import inlineCss from'posthtml-inline-css'

posthtml([
  inlineCss({
    removeInlinedSelectors: true
  })
])
  .process(`
    <style>
      .text-sm {
        font-size: 12px;
      }

      @media (min-width: 640px) {
        .text-sm {
          font-size: 16px;
        }
      }
    </style>

    <p class="text-sm">small text</p>
  `)
  .then(result => result.html)
```

Result:

```html
<style>
  @media (min-width: 640px) {
    .text-sm {
      font-size: 16px;
    }
  }
</style>

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
