import path from 'node:path'
import {readFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import posthtml from 'posthtml'
import {describe, expect, test} from 'vitest'
import plugin from '../lib/index.js'
import {normalizeNewline} from '../lib/utils.js'
import removeImportant from './stubs/_removeImportantPlugin.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const fixture = file => readFileSync(path.join(__dirname, 'fixtures', `${file}.html`), 'utf8')
const expected = file => readFileSync(path.join(__dirname, 'expected', `${file}.html`), 'utf8')
const clean = html => normalizeNewline(html).replaceAll(/[^\S\r\n]+$/gm, '').trim()

const process = (name, options, log = false) => {
  return posthtml([plugin(options)])
    .process(fixture(name))
    .then(result => log ? console.log(result.html) : result.html)
    .then(html => expect(clean(html)).toBe(clean(expected(name))))
}

test('<style> in <head>', () => {
  return process('style-in-head')
})

test('<style> in <body>', () => {
  return process('style-in-body')
})

test('Preserves at-rules', () => {
  return process('at-rules')
})

test('Existing inline styles', () => {
  return process('existing-style-attr')
})

test('Skip inlining', () => {
  return process('skip', {
    removeInlinedSelectors: true,
  })
})

test('Illegal values', () => {
  return process('illegal-values')
})

describe('Options', () => {
  test('Sanity check', () => {
    return process('options', {
      preserveImportant: true,
      recognizeNoValueAttribute: true,
    })
  })

  test('PostCSS plugins', () => {
    return process('postcss-plugins', {
      postcss: {
        plugins: [
          removeImportant,
        ],
      },
    })
  })

  test('processLinkTags (local)', () => {
    return process('link-local', {processLinkTags: true})
  })

  test('processLinkTags (remote)', () => {
    return process('link-remote', {processLinkTags: true})
  })

  test('processLinkTags (remote, fail)', async () => {
    await expect(() => process('link-remote-reject', {processLinkTags: true}))
      .rejects
      .toThrowError()
  })

  test('removeInlinedSelectors', () => {
    return process('remove-inlined', {removeInlinedSelectors: true})
  })

  test('safelist', () => {
    return process('safelist', {
      safelist: ['body', '.flex']
    })
  })

  test('excludedProperties', () => {
    return process('excluded-properties', {
      excludedProperties: ['color', 'display'],
    })
  })
})
