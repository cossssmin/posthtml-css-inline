<div align="center">
  <img width="150" height="150" alt="PostHTML" src="https://posthtml.github.io/posthtml/logo.svg">
  <h1>PostHTML CSS Inline</h1>
  <p>PostHTML plugin for inlining CSS to HTML style attributes</p>

  [![Version][npm-version-shield]][npm]
  [![Build][github-ci-shield]][github-ci]
  [![License][license-shield]][license]
  [![Downloads][npm-stats-shield]][npm-stats]
</div>

This is a work in progress, it's not ready for production yet.

TODO:

- [x] Support `<link rel="stylesheet">` tags
- [x] Remove inlined selectors from HTML elements
- [x] Support PostCSS plugins
- [ ] Support [complex selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_selectors/Selector_structure#complex_selector) *
- [x] Safelist (selectors that should not be inlined)
- [x] [Skip inlining](https://github.com/cossssmin/posthtml-css-inline/issues/9) on marked tags
- [ ] Juice-compatible options
  - [x] `excludedProperties`
  - [ ] `resolveCSSVariables`
  - [ ] `applyHeightAttributes`
  - [ ] `applyWidthAttributes`
  - [ ] `applyAttributesTableElements`

\* This needs to be implemented in PostHTML or [posthtml-match-helper](https://github.com/posthtml/posthtml-match-helper) first.

---

## About

This plugin will inline CSS from `<style>` and `<link rel="stylesheet">` tags into HTML `style` attributes.

The CSS will be parsed with [PostCSS](https://postcss.org/), so you can use PostCSS plugins to transform the CSS before it's inlined.

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
  div {
    color: red;
  }

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
$ npm i posthtml posthtml-css-inline
```

## Usage

To use the plugin, simply pass it to PostHTML:

```js
import posthtml from'posthtml'
import inlineCss from'posthtml-css-inline'

posthtml([
  inlineCss(options)
])
  .process('your HTML')
  .then(result => console.log(result.html))
```

## Options

You may configure how inlining works by passing an options object to the plugin.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| [`processLinkTags`](#processLinkTags) | `boolean` | `false` | Process `<link rel="stylesheet">` tags. |
| [`preserveImportant`](#preserveimportant) | `boolean` | `false` | Preserve `!important` in the inlined CSS value. |
| [`removeInlinedSelectors`](#removeinlinedselectors) | `boolean` | `false` | Remove selectors that were successfully inlined from both the `<style>` tag and from the HTML body. |
| [`postcss`](#postcss) | `object` | `{}` | Object to configure PostCSS. |
| [`safelist`](#safelist) | `array` | `[]` | Array of selectors that should not be inlined. |
| [`excludedProperties`](#excludedproperties) | `array` | `[]` | Array of CSS properties that should not be inlined. |

## Attributes

You may configure how inlining works on a per-element basis.

| Attribute | Description |
| --- | --- |
| [`no-inline`](#no-inline) | Skip inlining on this element. |

### `processLinkTags`

Type: `boolean`\
Default: `false`

Whether to process `<link rel="stylesheet">` tags.

The plugin will fetch the CSS from the URL in the `href` attribute, and replace the `<link>` tag with a `<style>` tag containing the CSS. This `<style>` tag will then be inlined into the HTML.

```js
import posthtml from'posthtml'
import inlineCss from'posthtml-css-inline'

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
import inlineCss from'posthtml-css-inline'

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

Whether to remove selectors that were successfully inlined from both the `<style>` tag and from the HTML body.

If a selector that has been inlined is also present inside an at-rule such as `@media`, it will not be removed from the HTML body.

```js
import posthtml from'posthtml'
import inlineCss from'posthtml-css-inline'

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
          font-size: 16px !important;
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
      font-size: 16px !important;
    }
  }
</style>

<p class="text-sm" style="font-size: 12px">small text</p>
```

### `postcss`

Type: `object`\
Default: `{}`

You may configure PostCSS and use PostCSS plugins to transform the CSS before it's inlined.

```js
import posthtml from'posthtml'
import inlineCss from'posthtml-css-inline'
// Imaginary PostCSS plugin that removes !important
import removeImportant from'remove-important-plugin'

posthtml([
  inlineCss({
    postcss: {
      plugins: [
        removeImportant
      ]
    }
  })
])
  .process(`
    <style>
      .text-sm {
        font-size: 12px !important;
      }

      @media (min-width: 640px) {
        .text-sm {
          font-size: 16px !important;
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
  .text-sm {
    font-size: 12px;
  }

  @media (min-width: 640px) {
    .text-sm {
      font-size: 16px;
    }
  }
</style>

<p class="text-sm" style="font-size: 12px">small text</p>
```

### `safelist`

Type: `array`\
Default: `[]`

Array of selectors that should not be inlined.

> [!NOTE]  
> The CSS `*` selector is not supported when inlining, you don't need to worry about safelisting it.

```js
import posthtml from'posthtml'
import inlineCss from'posthtml-css-inline'

posthtml([
  inlineCss({
    safelist: ['body', '.flex']
  })
])
  .process(`
    <style>
      .flex {
        display: flex;
      }

      body {
        color: blue;
      }

      p {
        color: red;
      }
    </style>

    <body>
      <p class="flex">small text</p>
    </body>
  `)
  .then(result => result.html)
```

Result:

```html
<body>
  <p class="flex" style="color: red">small text</p>
</body>
```

### `excludedProperties`

Type: `array`\
Default: `[]`

Array of CSS properties that should not be inlined.

```js
import posthtml from'posthtml'
import inlineCss from'posthtml-css-inline'

posthtml([
  inlineCss({
    excludedProperties: ['color', 'display']
  })
])
  .process(`
    <style>
      p {
        color: red;
        display: flex;
        font-size: 12px;
      }
    </style>

    <p>text</p>
  `)
  .then(result => result.html)
```

Result:

```html
<style>
  p {
    color: red;
    display: flex;
    font-size: 12px;
  }
</style>

<p style="font-size: 12px">text</p>
```

### `no-inline`

You may use the `no-inline` attribute on an element to prevent CSS inlining.

- when used on a `<style>` or `<link>` tag, the CSS inside the tag will not be inlined
- when used on any other tag, the inliner will not inline CSS on that tag

You may use any of the following attributes to achieve this on a `<style>` or `<link>` tag:

- `no-inline`
- `data-embed`
- `embed`
- `prevent-inline`
- `skip-inline`

Likewise, you may use any of the following attributes to achieve this on any other tag:

- `no-inline`
- `prevent-inline`
- `skip-inline`

The attribute will be removed from the tag in the resulting HTML.

```js
import posthtml from'posthtml'
import inlineCss from'posthtml-css-inline'

posthtml([
  inlineCss()
])
  .process(`
    <style no-inline>
      p {
        font-size: 12px;
      }
    </style>
    <style>
      div {
        color: blue;
      }
    </style>

    <p>small text</p>
    <div no-inline>b</div>
  `)
  .then(result => result.html)
```

Result:

```html
<style>
  p {
    font-size: 12px;
  }
</style>
<style>
  div {
    color: blue;
  }
</style>

<p>small text</p>
<div>b</div>
```


[npm]: https://www.npmjs.com/package/posthtml-css-inline
[npm-version-shield]: https://img.shields.io/npm/v/posthtml-css-inline.svg
[npm-stats]: http://npm-stat.com/charts.html?package=posthtml-css-inline
[npm-stats-shield]: https://img.shields.io/npm/dt/posthtml-css-inline.svg
[github-ci]: https://github.com/cossssmin/posthtml-css-inline/actions/workflows/nodejs.yml
[github-ci-shield]: https://github.com/cossssmin/posthtml-css-inline/actions/workflows/nodejs.yml/badge.svg
[license]: ./license
[license-shield]: https://img.shields.io/npm/l/posthtml-css-inline.svg
