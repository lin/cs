const charCodes = require("charcodes")
const tt = require('../types').types

function getTokenFromCode(code) {
  switch (code) {
    // Punctuation tokens.
    case charCodes.leftParenthesis:
      ++this.state.pos;
      this.finishToken(tt.parenL);
      return;
    case charCodes.rightParenthesis:
      ++this.state.pos;
      this.finishToken(tt.parenR);
      return;
    case charCodes.semicolon:
      ++this.state.pos;
      this.finishToken(tt.semi);
      return;
    case charCodes.comma:
      ++this.state.pos;
      this.finishToken(tt.comma);
      return;
    case charCodes.leftSquareBracket:
      ++this.state.pos;
      this.finishToken(tt.bracketL);
      return;
    case charCodes.rightSquareBracket:
      ++this.state.pos;
      this.finishToken(tt.bracketR);
      return;
    case charCodes.leftCurlyBrace:
      ++this.state.pos;
      this.finishToken(tt.braceL);
      return;
    case charCodes.rightCurlyBrace:
      ++this.state.pos;
      this.finishToken(tt.braceR);
      return;
    case charCodes.colon:
      ++this.state.pos;
      this.finishToken(tt.colon);
      return;
    case charCodes.graveAccent:
      ++this.state.pos;
      this.finishToken(tt.backQuote);
      return;
    default:
      throw new SyntaxError('Not implemented');
  }
}

module.exports = {getTokenFromCode}
