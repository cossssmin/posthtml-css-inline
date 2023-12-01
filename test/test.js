import path from 'node:path'
import {readFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import test from 'ava'
import posthtml from 'posthtml'
import plugin from '../lib/index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const fixture = file => readFileSync(path.join(__dirname, 'fixtures', `${file}.html`), 'utf8')
const expected = file => readFileSync(path.join(__dirname, 'expected', `${file}.html`), 'utf8')

// eslint-disable-next-line
const error = (name, options, cb) => posthtml([plugin(options)]).process(fixture(name)).catch(cb)
const clean = html => html.replace(/[^\S\r\n]+$/gm, '').trim()

const process = (t, name, options, log = false) => {
  return posthtml([plugin(options)])
    .process(fixture(name))
    .then(result => log ? console.log(result.html) : clean(result.html))
    .then(html => t.is(html, expected(name).trim()))
}

test('Plugin options', t => {
  return process(t, 'options', {preserveImportant: true, posthtml: {recognizeNoValueAttribute: true}})
})

test('Inlines <style> in <head>', t => {
  return process(t, 'style-in-head')
})

test('Inlines <style> in <body>', t => {
  return process(t, 'style-in-body')
})

test('Preserves at-rules', t => {
  return process(t, 'at-rules')
})

test('Preserves inlined selectors', t => {
  return process(t, 'preserve-inlined', {removeInlinedSelectors: false})
})

test('Works with existing inline styles', t => {
  return process(t, 'existing-style-attr')
})
