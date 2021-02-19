let registerRegExp = /^%([e]?(?:[abcd][xhl]|si|di|sp|bp))/
let numRegExp = /^(0[xX][\dabcdefABCDEF]+|[\d]+)/

let cursor = 0

function tokenizer (input) {

  let cursor = 0
  let tokens = []

  while (cursor < input.length) {

    let char = input[cursor]
    let rest = input.substring(cursor)

    switch (char) {
      case ' ':
      case '\n':
      case '\t':
      case '\r':
        cursor++
        continue

      case '(':
      case ')':
      case '$':
      case ',':
        tokens.push({type: char, value: char})
        cursor++
        continue
    }

    let match

    if ((match = rest.match(registerRegExp))) {
      tokens.push({
        type: 'register',
        value: match[1]
      })
      cursor += match[0].length
      continue
    }

    if ((match = rest.match(numRegExp))) {
      tokens.push({
        type: 'number',
        value: match[1]
      })
      cursor += match[0].length
      continue
    }

    error()

  }

  return tokens
}

module.exports = tokenizer
