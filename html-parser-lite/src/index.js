/*!
 * HTML Parser By John Resig (ejohn.org)
 * Modified by Juriy "kangax" Zaytsev, used in vue.js
 * Modified Again by Yingkui Lin based on @babel/parser style
 * Original code by Erik Arvidsson (MPL-1.1 OR Apache-2.0 OR GPL-2.0-or-later)
 * http://erik.eae.net/simplehtmlparser/simplehtmlparser.js
 */

const Lexer = require('./lexer')
const isPlainTextTag = (tag) => {
  return ['script', 'style', 'textarea'].indexOf(tag) !== -1
}

class HTMLParser extends Lexer {

  parse () {
    while(this.state.pos < this.length) {
      if (this.state.lastTag && isPlainTextTag(this.state.lastTag)) {
        this.parsePlainTextTag()
      } else {
        switch (this.curr()) {
          case '<':
            switch (this.next()) {
              case '/':
                this.parseMaybeEndTag()
                break;
              case '!':
                this.parseMaybeComments()
                break;
              default:
                this.parseMaybeStartTag()
            }
            break;
          default:
            this.parseText()
        } // switch
      } // else
    } // if
  } // parse

}

Object.assign(
  HTMLParser.prototype,
  require('./text'),
  require('./start'),
  require('./end'),
  require('./comments'),
  require('./plain'),
)

module.exports = HTMLParser
