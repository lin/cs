const lineBreak = /\r\n?|[\n\u2028\u2029]/g;

class Position {
  constructor(line, col) {
    this.line = line;
    this.column = col;
  }
}

class SourceLocation {
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }
}

function getLineInfo(input, offset) {
  let line = 1;
  let lineStart = 0;
  let match;
  lineBreak.lastIndex = 0;
  while ((match = lineBreak.exec(input)) && match.index < offset) {
    line++;
    lineStart = lineBreak.lastIndex;
  }

  return new Position(line, offset - lineStart);
}

module.exports = {Position}
