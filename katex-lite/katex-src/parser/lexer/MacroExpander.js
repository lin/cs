const {symbols} = require("../../symbols");
const {Lexer} = require("./Lexer");
const Token = require("./Token");
const Namespace = require("./Namespace");
const {builtinMacros} = require("./macros");

// List of commands that act like macros but aren't defined as a macro,
// function, or symbol.  Used in `isDefined`.
const implicitCommands = {
    "\\relax": true,     // MacroExpander.js
    "^": true,           // Parser.js
    "_": true,           // Parser.js
    "\\limits": true,    // Parser.js
    "\\nolimits": true,  // Parser.js
};

class MacroExpander {

    constructor(input, settings, mode) {
        this.settings = settings;
        this.expansionCount = 0;
        this.feed(input);
        this.macros = new Namespace(builtinMacros, {});
        this.mode = mode;
        this.stack = []; // contains tokens in REVERSE order
    }

    /**
     * Determine whether a command is currently "defined" (has some
     * functionality), meaning that it's a macro (in the current group),
     * a function, a symbol, or one of the special commands listed in
     * `implicitCommands`.
     */
    isDefined(name) {
        return this.macros.has(name) ||
            // functions.hasOwnProperty(name) ||
            symbols.math.hasOwnProperty(name) ||
            symbols.text.hasOwnProperty(name) ||
            implicitCommands.hasOwnProperty(name);
    }
}

Object.assign(
  MacroExpander.prototype,
  require('./MacroExpander/core'),
  require('./MacroExpander/expand'),
)

module.exports = {implicitCommands, MacroExpander}
