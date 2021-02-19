const SourceLocation = require('../parser/location').SourceLocation

// START END LOC EXAMPLES
// "start": 0,
// "end": 61,
// "loc": {
//   "start": {
//     "line": 1,
//     "column": 0
//   },
//   "end": {
//     "line": 3,
//     "column": 1
//   }
// }

class Token {
  constructor(state) {
    this.type = state.type; // type is a object, but can be considered as a string
    this.value = state.value; // semantic value of the token
    this.start = state.start;
    this.end = state.end;
    // contains line column info
    this.loc = new SourceLocation(state.startLoc, state.endLoc);
  }
}
