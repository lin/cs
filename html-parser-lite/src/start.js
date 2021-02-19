const re = require('./re')

function parseMaybeStartTag () {

  const startMatch = this.match(re.startTagOpen)

  if (startMatch) {

    let tagName = startMatch[1]

    this.contentStart()
    this.advance(startMatch[0].length)

    let attrs = this.handleAttributes()

    let endMatch = this.match(re.startTagClose)

    if (endMatch) {

      this.advance(endMatch[0].length)
      this.contentEnd()

      let isUnary = !!endMatch[1]

      this.visit('start', {tagName, attrs, isUnary})

      if (!isUnary) {
        this.stack.push({
          tagName,
          lowerCasedTag: tagName.toLowerCase(),
          attrs,
          start: this.state.start,
          end: this.state.end
        })
        this.state.lastTag = tagName
      }
    }

  } else {
    this.parseText()
  }
}

function handleAttributes () {

  let endMatch, attrMatch, attrs = []

  while (
    !this.match(re.startTagClose) &&
    (attrMatch = this.match(re.attribute))
  ) {

    this.contentStart()
    this.advance(attrMatch[0].length)
    this.contentEnd()

    let attrValue = attrMatch[3] || attrMatch[4] || attrMatch[5] || ''

    attrs.push({
      name: attrMatch[1],
      value: decodeAttrValue(attrValue),
      start: this.state.start + attrMatch[0].match(/^\s*/).length,
      end: this.state.end
    })

  }

  return attrs
}

function decodeAttrValue (value) {

  const encodedAttr = /&(?:lt|gt|quot|amp|#39);/g
  const decodingMap = {
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&amp;': '&',
    '&#10;': '\n',
    '&#9;': '\t',
    '&#39;': "'"
  }

  return value.replace(encodedAttr, match => decodingMap[match])

}

module.exports = {parseMaybeStartTag, handleAttributes}
