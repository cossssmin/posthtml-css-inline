import {calculate, compareDesc} from 'specificity'

export function sortCssNodesBySpecificity(nodes) {
  return nodes.sort((a, b) => {
    const specificityA = typeof a.selector === 'string' ? calculate(a.selector) : {A: 0, B: 0, C: 0}
    const specificityB = typeof b.selector === 'string' ? calculate(b.selector) : {A: 0, B: 0, C: 0}

    return compareDesc(specificityA, specificityB)
  })
}

export function normalizeNewline(input) {
  return input.replace(new RegExp('\r\n', 'g'), '\n') // eslint-disable-line
}
