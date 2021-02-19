const re = require('./re')

function parseMaybeEndTag () {

  let endTagMatch = this.match(re.endTag)

  if (endTagMatch) {

    const tagName = endTagMatch[1]
    const lowerCasedTagName = tagName.toLowerCase()

    this.contentStart()
    this.advance(endTagMatch[0].length)
    this.contentEnd()

    let lastIndex = getLastIndexOf(this.stack, lowerCasedTagName)

    if (lastIndex != -1) {
      // call the visitor up to the last index found
      for (let i = this.stack.length - 1; i >= lastIndex; i--) {
        this.visit('end', { tagName: this.stack[i].tagName })
      }
      // pop the stack and restore the last tag name
      this.stack.length = lastIndex
      this.state.lastTag = lastIndex && this.stack[lastIndex - 1].tagName
    } else if (lowerCasedTagName === 'br') {
      this.visit('start', { tagName })
    } else if (lowerCasedTagName === 'p') {
      this.visit('start', { tagName })
      this.visit('end', { tagName })
    }

  } else {
    this.parseText()
  }

}

function getLastIndexOf (stack, lowerCasedTagName) {
  return stack.map(e => e.lowerCasedTag).lastIndexOf(lowerCasedTagName)
}

module.exports = {parseMaybeEndTag}
