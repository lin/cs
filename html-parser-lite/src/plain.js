
function parsePlainTextTag () {

  // re example: `group1 </script >`
  const tag = this.state.lastTag.toLowerCase()
  const re = new RegExp('([\\s\\S]*?)(</' + tag + '[^>]*>)', 'i')
  const match = this.match(re)

  if (match) {

    this.contentStart()
    this.advance(match[1].length)
    this.contentEnd()

    this.visit('plain')

    this.parseMaybeEndTag()

  } else {
    // move to poniter to the end
    // stop the parsing
    this.state.pos = this.length + 1
  }

}

module.exports = {parsePlainTextTag}
