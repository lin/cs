class SourceLocation {

    constructor(lexer, start, end){
        this.lexer = lexer;
        this.start = start;
        this.end   = end;
    }

    static range(first, second){
        if (!second) {
            return first && first.loc;
            // this is simply a way to shortcut the computation
            // nothing magic happens here.
        } else if (!first || !first.loc || !second.loc ||
                   first.loc.lexer !== second.loc.lexer) {
            return null;
        } else {
            return new SourceLocation(
                    first.loc.lexer, first.loc.start, second.loc.end);
        }
    }
}

module.exports = SourceLocation
