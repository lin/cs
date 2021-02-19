const SourceLocation = require("./SourceLocation");

class Token {
    constructor(text, loc) {
        this.text = text;
        this.loc = loc;
    }

    range(endToken, text) {
        return new Token(text, SourceLocation.range(this, endToken));
    }
}

module.exports = Token
