import path from 'node:path'
import {readFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import test from 'ava'
import posthtml from 'posthtml'
import plugin from '../lib/index.js'
import {normalizeNewline} from '../lib/utils.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const fixture = file => readFileSync(path.join(__dirname, 'fixtures', `${file}.html`), 'utf8')
const expected = file => readFileSync(path.join(__dirname, 'expected', `${file}.html`), 'utf8')

// eslint-disable-next-line
const error = (name, options, cb) => posthtml([plugin(options)]).process(fixture(name)).catch(cb)
const clean = html => normalizeNewline(html).replaceAll(/[^\S\r\n]+$/gm, '').trim()

const process = (t, name, options, log = false) => {
  return posthtml([plugin(options)])
    .process(fixture(name))
    .then(result => log ? console.log(result.html) : clean(result.html))
    .then(html => t.is(clean(html), clean(expected(name))))
}

test('Plugin options', t => {
  return process(t, 'options', {
    preserveImportant: true,
    recognizeNoValueAttribute: true,
  })
})

test('<style> in <head>', t => {
  return process(t, 'style-in-head')
})

test('<style> in <body>', t => {
  return process(t, 'style-in-body')
})

test('Local <link> tags', t => {
  return process(t, 'link-local', {processLinkTags: true})
})

test('Remote <link> tags', t => {
  return process(t, 'link-remote', {processLinkTags: true})
})

test('Remote <link> tags (fail)', async t => {
  const error = await t.throwsAsync(process(t, 'link-remote-reject', {processLinkTags: true}))
  t.is(error.name, 'FetchError')
})

test('Preserves at-rules', t => {
  return process(t, 'at-rules')
})

test('Removes inlined selectors', t => {
  return process(t, 'remove-inlined', {removeInlinedSelectors: true})
})

test('Works with existing inline styles', t => {
  return process(t, 'existing-style-attr')
})
