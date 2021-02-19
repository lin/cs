const re = require('./re')

function parseText () {

  const ltIndex = this.find('<')

  if (ltIndex >= 0) {
    // update the rest string
    this.contentStart()
    this.advance((ltIndex == 0 ? 1 : ltIndex))

    while (
      !this.test(re.endTag) &&
      !this.test(re.startTagOpen) &&
      !this.test(re.comment) &&
      !this.test(re.conditionalComment) &&
      !this.test(re.doctype)
    ) {
      // if after a < is not a letter, it might be a plain <
      // so let's keep ignoring < as a normal char in plain text
      next = this.find('<', 1)
      if (next < 0) break
      this.advance(next)
    }

    this.contentEnd()
    this.visit('text')
  }

}

module.exports = {parseText}
