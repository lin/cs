const re = require('./re')

function parseMaybeComments () {

  let doctypeMatch

  if (this.test(re.comment)) {

    const commentEnd = this.find('-->')

    if (commentEnd !== -1) {
      this.advance(commentEnd + 3)
    }

  } else if (this.test(re.conditionalComment)) {

    const conditionalEnd = this.find(']>')

    if (conditionalEnd >= 0) {
      this.advance(conditionalEnd + 2)
    }

  } else if ((doctypeMatch = this.match(re.doctype))) {

    this.advance(doctypeMatch[0].length)

  }

}

module.exports = {parseMaybeComments}
