const {functions}          =  require("../functions");
const MacroExpander        = require("./lexer//MacroExpander").MacroExpander;
const implicitCommands     = require("./lexer//MacroExpander").implicitCommands;
const symbols              = require("../symbols").symbols;
const ATOMS                = require("../symbols").ATOMS;
const extraLatin           = require("../symbols").extraLatin;
const validUnit            = require("../units").validUnit;
const supportedCodepoint   = require("../unicodeScripts").supportedCodepoint;
const unicodeAccents       = require("../unicodeAccents").unicodeAccents;
const unicodeSymbols       = require("../unicodeSymbols").unicodeSymbols;
const utils                = require("../utils").utils;
const checkNodeType        = require("../parseNode").checkNodeType;
const combiningDiacriticalMarksEndRegex
                           = require("./lexer/Lexer").combiningDiacriticalMarksEndRegex;
const SourceLocation       = require("./lexer//SourceLocation");
const Token                = require("./lexer//Token");

class Parser {

  constructor(input, settings) {
    this.mode = "math";
    this.gullet = new MacroExpander(input, settings, this.mode);
    this.settings = settings;
    this.leftrightDepth = 0;
  }

  parse() {
    this.gullet.beginGroup();
    this.consume();
    const parse = this.parseExpression(false);
    this.expect("EOF", false);
    this.gullet.endGroup();
    return parse;
  }

  parseExpression(breakOnInfix, breakOnTokenText) {
      const body = [];
      while (true) {
          // Ignore spaces in math mode
          if (this.mode === "math") {
              this.consumeSpaces();
          }
          const lex = this.nextToken;
          if (Parser.endOfExpression.indexOf(lex.text) !== -1) { break; }
          const atom = this.parseAtom(breakOnTokenText);
          if (!atom) { break;}
          body.push(atom);
      }
      return body
  }

  parseAtom(breakOnTokenText) {
      // The body of an atom is an implicit group, so that things like
      // \left(x\right)^2 work correctly.
      const base = this.parseGroup("atom", false, null, breakOnTokenText);

      if (this.mode === "text") { return base; }

      let superscript;
      let subscript;
      while (true) {
          this.consumeSpaces();
          const lex = this.nextToken;

          if (lex.text === "\\limits" || lex.text === "\\nolimits") {
              // We got a limit control
              const opNode = checkNodeType(base, "op");
              if (opNode) {
                  const limits = lex.text === "\\limits";
                  opNode.limits = limits;
                  opNode.alwaysHandleSupSub = true;
              } else {
                  throw new SyntaxError(
                      "Limit controls must follow a math operator",
                      lex);
              }
              this.consume();
          } else if (lex.text === "^") {
              // We got a superscript start
              if (superscript) {
                  throw new SyntaxError("Double superscript", lex);
              }
              superscript = this.handleSupSubscript("superscript");
          } else if (lex.text === "_") {
              // We got a subscript start
              if (subscript) {
                  throw new SyntaxError("Double subscript", lex);
              }
              subscript = this.handleSupSubscript("subscript");
          } else if (lex.text === "'") {
              // We got a prime
              if (superscript) {
                  throw new SyntaxError("Double superscript", lex);
              }
              const prime = {type: "textord", mode: this.mode, text: "\\prime"};

              // Many primes can be grouped together, so we handle this here
              const primes = [prime];
              this.consume();
              // Keep lexing tokens until we get something that's not a prime
              while (this.nextToken.text === "'") {
                  // For each one, add another prime to the list
                  primes.push(prime);
                  this.consume();
              }
              // If there's a superscript following the primes, combine that
              // superscript in with the primes.
              if (this.nextToken.text === "^") {
                  primes.push(this.handleSupSubscript("superscript"));
              }
              // Put everything into an ordgroup as the superscript
              superscript = {type: "ordgroup", mode: this.mode, body: primes};
          } else {
              // If it wasn't ^, _, or ', stop parsing super/subscripts
              break;
          }
      }

      // Base must be set if superscript or subscript are set per logic above,
      // but need to check here for type check to pass.
      if (superscript || subscript) {
          // If we got either a superscript or subscript, create a supsub
          return {
              type: "supsub",
              mode: this.mode,
              base: base,
              sup: superscript,
              sub: subscript,
          };
      } else {
          // Otherwise return the original body
          return base;
      }
  }

  parseGroup(name, optional, greediness, breakOnTokenText, mode) {
      const outerMode = this.mode;
      const firstToken = this.nextToken;
      const text = firstToken.text;
      // Switch to specified mode
      if (mode) {
          this.switchMode(mode);
      }

      let groupEnd;
      let result;
      // Try to parse an open brace or \begingroup
      if (optional ? text === "["  : text === "{" || text === "\\begingroup") {
          groupEnd = Parser.endOfGroup[text];
          // Start a new group namespace
          this.gullet.beginGroup();
          // If we get a brace, parse an expression
          this.consume();
          const expression = this.parseExpression(false, groupEnd);
          const lastToken = this.nextToken;
          // End group namespace before consuming symbol after close brace
          this.gullet.endGroup();
          result = {
              type: "ordgroup",
              mode: this.mode,
              loc: SourceLocation.range(firstToken, lastToken),
              body: expression,
              // A group formed by \begingroup...\endgroup is a semi-simple group
              // which doesn't affect spacing in math mode, i.e., is transparent.
              // https://tex.stackexchange.com/questions/1930/when-should-one-
              // use-begingroup-instead-of-bgroup
              semisimple: text === "\\begingroup" || undefined,
          };
      } else if (optional) {
          // Return nothing for an optional group
          result = null;
      } else {
          // If there exists a function with this name, parse the function.
          // Otherwise, just return a nucleus
          result = this.parseFunction(breakOnTokenText, name, greediness) ||
              this.parseSymbol();
      }

      // Switch mode back
      if (mode) {
          this.switchMode(outerMode);
      }
      // Make sure we got a close brace
      if (groupEnd) {
          this.expect(groupEnd);
      }
      return result;
  }

  parseFunction(
      breakOnTokenText, // } \endgroup
      name, // For error reporting.
      greediness
  ) {
      const token = this.nextToken;
      const func = token.text; // we got a function
      const funcData = functions[func];

      // const funcData = undefined
      if (!funcData) {
          return null;
      }

      if (greediness != null && funcData.greediness <= greediness) {
          throw new SyntaxError(
              "Got function '" + func + "' with no arguments" +
              (name ? " as " + name : ""), token);
      } else if (this.mode === "text" && !funcData.allowedInText) {
          throw new SyntaxError(
              "Can't use function '" + func + "' in text mode", token);
      } else if (this.mode === "math" && funcData.allowedInMath === false) {
          throw new SyntaxError(
              "Can't use function '" + func + "' in math mode", token);
      }

      // hyperref package sets the catcode of % as an active character
      if (funcData.argTypes && funcData.argTypes[0] === "url") {
          this.gullet.lexer.setCatcode("%", 13);
      }

      // Consume the command token after possibly switching to the
      // mode specified by the function (for instant mode switching),
      // and then immediately switch back.
      if (funcData.consumeMode) {
          const oldMode = this.mode;
          this.switchMode(funcData.consumeMode);
          this.consume();
          this.switchMode(oldMode);
      } else {
          this.consume();
      }
      const {args, optArgs} = this.parseArguments(func, funcData);
      return this.callFunction(func, args, optArgs, token, breakOnTokenText);
  }

  /**
   * Call a function handler with a suitable context and arguments.
   */
  callFunction(
      name,
      args,
      optArgs,
      token,
      breakOnTokenText
  ) {
      const context = {
          funcName: name,
          parser: this,
          token,
          breakOnTokenText,
      };
      const func = functions[name];
      if (func && func.handler) {
          return func.handler(context, args, optArgs);
      } else {
          throw new SyntaxError(`No function handler for ${name}`);
      }
  }

  /**
   * Parses the arguments of a function or environment
   */
  parseArguments(
      func,   // Should look like "\name" or "\begin{name}".
      funcData
  ) {
      const totalArgs = funcData.numArgs + funcData.numOptionalArgs;
      if (totalArgs === 0) {
          return {args: [], optArgs: []};
      }

      const baseGreediness = funcData.greediness;
      const args = [];
      const optArgs = [];

      for (let i = 0; i < totalArgs; i++) {
          const argType = funcData.argTypes && funcData.argTypes[i];
          const isOptional = i < funcData.numOptionalArgs;
          // Ignore spaces between arguments.  As the TeXbook says:
          // "After you have said ‘\def\row#1#2{...}’, you are allowed to
          //  put spaces between the arguments (e.g., ‘\row x n’), because
          //  TeX doesn’t use single spaces as undelimited arguments."
          if (i > 0 && !isOptional) {
              this.consumeSpaces();
          }
          // Also consume leading spaces in math mode, as parseSymbol
          // won't know what to do with them.  This can only happen with
          // macros, e.g. \frac\foo\foo where \foo expands to a space symbol.
          // In LaTeX, the \foo's get treated as (blank) arguments).
          // In KaTeX, for now, both spaces will get consumed.
          // TODO(edemaine)
          if (i === 0 && !isOptional && this.mode === "math") {
              this.consumeSpaces();
          }
          const nextToken = this.nextToken;
          const arg = this.parseGroupOfType("argument to '" + func + "'",
              argType, isOptional, baseGreediness);
          if (!arg) {
              if (isOptional) {
                  optArgs.push(null);
                  continue;
              }
              throw new SyntaxError(
                  "Expected group after '" + func + "'", nextToken);
          }
          (isOptional ? optArgs : args).push(arg);
      }

      return {args, optArgs};
  }


  /**
   * Parse a single symbol out of the string. Here, we handle single character
   * symbols and special functions like verbatim
   */
  parseSymbol() {

      const nucleus = this.nextToken;
      let text = nucleus.text;

      if (/^\\verb[^a-zA-Z]/.test(text)) {
          this.consume();
          let arg = text.slice(5);
          const star = (arg.charAt(0) === "*");
          if (star) {
              arg = arg.slice(1);
          }
          // Lexer's tokenRegex is constructed to always have matching
          // first/last characters.
          if (arg.length < 2 || arg.charAt(0) !== arg.slice(-1)) {
              throw new SyntaxError(`\\verb assertion failed --
                  please report what input caused this bug`);
          }
          arg = arg.slice(1, -1);  // remove first and last char
          return {
              type: "verb",
              mode: "text",
              body: arg,
              star,
          };
      }

      // At this point, we should have a symbol, possibly with accents.
      // First expand any accented base symbol according to unicodeSymbols.
      if (unicodeSymbols.hasOwnProperty(text[0]) &&
          !symbols[this.mode][text[0]]) {
          // This behavior is not strict (XeTeX-compatible) in math mode.
          // if (this.settings.strict && this.mode === "math") {
          //     this.settings.reportNonstrict("unicodeTextInMathMode",
          //         `Accented Unicode text character "${text[0]}" used in ` +
          //         `math mode`, nucleus);
          // }
          text = unicodeSymbols[text[0]] + text.substr(1);
      }

      // Strip off any combining characters
      const match = combiningDiacriticalMarksEndRegex.exec(text);
      if (match) {
          text = text.substring(0, match.index);
          if (text === 'i') {
              text = '\u0131';  // dotless i, in math and text mode
          } else if (text === 'j') {
              text = '\u0237';  // dotless j, in math and text mode
          }
      }

      // Recognize base symbol
      let symbol;
      if (symbols[this.mode][text]) {
          const group = symbols[this.mode][text].group;
          const loc = SourceLocation.range(nucleus);
          let s;
          if (ATOMS.hasOwnProperty(group)) {
              // $FlowFixMe
              const family = group;
              s = {
                  type: "atom",
                  mode: this.mode,
                  family,
                  loc,
                  text,
              };
          } else {
              // $FlowFixMe
              s = {
                  type: group,
                  mode: this.mode,
                  loc,
                  text,
              };
          }
          symbol = s;
      } else if (text.charCodeAt(0) >= 0x80) { // no symbol for e.g. ^
          symbol = {
              type: "textord",
              mode: this.mode,
              loc: SourceLocation.range(nucleus),
              text,
          };
      } else {
          return null;  // EOF, ^, _, {, }, etc.
      }

      this.consume();
      
      // Transform combining characters into accents
      if (match) {
          for (let i = 0; i < match[0].length; i++) {
              const accent = match[0][i];
              if (!unicodeAccents[accent]) {
                  throw new SyntaxError(`Unknown accent ' ${accent}'`, nucleus);
              }
              const command = unicodeAccents[accent][this.mode];
              if (!command) {
                  throw new SyntaxError(
                      `Accent ${accent} unsupported in ${this.mode} mode`,
                      nucleus);
              }
              symbol = {
                  type: "accent",
                  mode: this.mode,
                  loc: SourceLocation.range(nucleus),
                  label: command,
                  isStretchy: false,
                  isShifty: true,
                  base: symbol,
              };
          }
      }
      return symbol;
  }


  /**
   * Parses a group when the mode is changing.
   */
  parseGroupOfType(
      name,
      type,
      optional,
      greediness,
  ) {
      switch (type) {
          case "color":
              return this.parseColorGroup(optional);
          case "size":
              return this.parseSizeGroup(optional);
          case "url":
              return this.parseUrlGroup(optional);
          case "math":
          case "text":
              return this.parseGroup(name, optional, greediness, undefined, type);
          case "raw": {
              if (optional && this.nextToken.text === "{") {
                  return null;
              }
              const token = this.parseStringGroup("raw", optional, true);
              if (token) {
                  return {
                      type: "raw",
                      mode: "text",
                      string: token.text,
                  };
              } else {
                  throw new SyntaxError("Expected raw group", this.nextToken);
              }
          }
          case "original":
          case null:
          case undefined:
              return this.parseGroup(name, optional, greediness);
          default:
              throw new SyntaxError(
                  "Unknown group type as " + name, this.nextToken);
      }
  }

  /**
   * Parses a color description.
   */
  parseColorGroup(optional) {
      const res = this.parseStringGroup("color", optional);
      if (!res) {
          return null;
      }
      const match = (/^(#[a-f0-9]{3}|#?[a-f0-9]{6}|[a-z]+)$/i).exec(res.text);
      if (!match) {
          throw new SyntaxError("Invalid color: '" + res.text + "'", res);
      }
      let color = match[0];
      if (/^[0-9a-f]{6}$/i.test(color)) {
          // We allow a 6-digit HTML color spec without a leading "#".
          // This follows the xcolor package's HTML color model.
          // Predefined color names are all missed by this RegEx pattern.
          color = "#" + color;
      }
      return {
          type: "color-token",
          mode: this.mode,
          color,
      };
  }

  /**
   * Parses a size specification, consisting of magnitude and unit.
   */
  parseSizeGroup(optional) {
      let res;
      let isBlank = false;
      if (!optional && this.nextToken.text !== "{") {
          res = this.parseRegexGroup(
              /^[-+]? *(?:$|\d+|\d+\.\d*|\.\d*) *[a-z]{0,2} *$/, "size");
      } else {
          res = this.parseStringGroup("size", optional);
      }
      if (!res) {
          return null;
      }
      if (!optional && res.text.length === 0) {
          // Because we've tested for what is !optional, this block won't
          // affect \kern, \hspace, etc. It will capture the mandatory arguments
          // to \genfrac and \above.
          res.text = "0pt";    // Enable \above{}
          isBlank = true;      // This is here specifically for \genfrac
      }
      const match = (/([-+]?) *(\d+(?:\.\d*)?|\.\d+) *([a-z]{2})/).exec(res.text);
      if (!match) {
          throw new SyntaxError("Invalid size: '" + res.text + "'", res);
      }
      const data = {
          number: +(match[1] + match[2]), // sign + magnitude, cast to number
          unit: match[3],
      };
      if (!validUnit(data)) {
          throw new SyntaxError("Invalid unit: '" + data.unit + "'", res);
      }
      return {
          type: "size",
          mode: this.mode,
          value: data,
          isBlank,
      };
  }

  /**
   * Parses an URL, checking escaped letters and allowed protocols.
   */
  parseUrlGroup(optional) {
      const res = this.parseStringGroup("url", optional, true); // get raw string
      if (!res) {
          return null;
      }
      // hyperref package allows backslashes alone in href, but doesn't
      // generate valid links in such cases; we interpret this as
      // "undefined" behaviour, and keep them as-is. Some browser will
      // replace backslashes with forward slashes.
      const url = res.text.replace(/\\([#$%&~_^{}])/g, '$1');
      // let protocol = /^\s*([^\\/#]*?)(?::|&#0*58|&#x0*3a)/i.exec(url);
      // protocol = (protocol != null ? protocol[1] : "_relative");
      // const allowed = this.settings.allowedProtocols;
      // if (!utils.contains(allowed,  "*") &&
      //     !utils.contains(allowed, protocol)) {
      //     throw new SyntaxError(
      //         `Forbidden protocol '${protocol}'`, res);
      // }
      return {
          type: "url",
          mode: this.mode,
          url,
      };
  }

  /**
   * Parses a group, essentially returning the string formed by the
   * brace-enclosed tokens plus some position information.
   */
  parseStringGroup(
      modeName,  // Used to describe the mode in error messages.
      optional,
      raw,
  ) {
      const groupBegin = optional ? "[" : "{";
      const groupEnd = optional ? "]" : "}";
      const nextToken = this.nextToken;
      if (nextToken.text !== groupBegin) {
          if (optional) {
              return null;
          } else if (raw && nextToken.text !== "EOF" &&
                  /[^{}[\]]/.test(nextToken.text)) {
              // allow a single character in raw string group
              this.gullet.lexer.setCatcode("%", 14); // reset the catcode of %
              this.consume();
              return nextToken;
          }
      }
      const outerMode = this.mode;
      this.mode = "text";
      this.expect(groupBegin);
      let str = "";
      const firstToken = this.nextToken;
      let nested = 0; // allow nested braces in raw string group
      let lastToken = firstToken;
      while ((raw && nested > 0) || this.nextToken.text !== groupEnd) {
          switch (this.nextToken.text) {
              case "EOF":
                  throw new SyntaxError(
                      "Unexpected end of input in " + modeName,
                      firstToken.range(lastToken, str));
              case groupBegin:
                  nested++;
                  break;
              case groupEnd:
                  nested--;
                  break;
          }
          lastToken = this.nextToken;
          str += lastToken.text;
          this.consume();
      }
      this.mode = outerMode;
      this.gullet.lexer.setCatcode("%", 14); // reset the catcode of %
      this.expect(groupEnd);
      return firstToken.range(lastToken, str);
  }

  /**
   * Parses a regex-delimited group: the largest sequence of tokens
   * whose concatenated strings match `regex`. Returns the string
   * formed by the tokens plus some position information.
   */
  parseRegexGroup(
      regex,
      modeName,   // Used to describe the mode in error messages.
  ) {
      const outerMode = this.mode;
      this.mode = "text";
      const firstToken = this.nextToken;
      let lastToken = firstToken;
      let str = "";
      while (this.nextToken.text !== "EOF" &&
              regex.test(str + this.nextToken.text)) {
          lastToken = this.nextToken;
          str += lastToken.text;
          this.consume();
      }
      if (str === "") {
          throw new SyntaxError(
              "Invalid " + modeName + ": '" + firstToken.text + "'",
              firstToken);
      }
      this.mode = outerMode;
      return firstToken.range(lastToken, str);
  }


  /**
   * Handle a subscript or superscript with nice errors.
   */
  handleSupSubscript(
      name,   // For error reporting.
  ) {
      const symbolToken = this.nextToken;
      const symbol = symbolToken.text;
      this.consume();
      this.consumeSpaces(); // ignore spaces before sup/subscript argument
      const group = this.parseGroup(name, false, Parser.SUPSUB_GREEDINESS);

      // if (!group) {
      //     throw new SyntaxError(
      //         "Expected group after '" + symbol + "'",
      //         symbolToken
      //     );
      // }

      return group;
  }


  /**
   * Converts the textual input of an unsupported command into a text node
   * contained within a color node whose color is determined by errorColor
   */
  handleUnsupportedCmd() {
      const text = this.nextToken.text;
      const textordArray = [];

      for (let i = 0; i < text.length; i++) {
          textordArray.push({type: "textord", mode: "text", text: text[i]});
      }

      const textNode = {
          type: "text",
          mode: this.mode,
          body: textordArray,
      };

      const colorNode = {
          type: "color",
          mode: this.mode,
          // color: this.settings.errorColor,
          body: [textNode],
      };

      this.consume();
      return colorNode;
  }

  /**
   * Rewrites infix operators such as \over with corresponding commands such
   * as \frac.
   *
   * There can only be one infix operator per group.  If there's more than one
   * then the expression is ambiguous.  This can be resolved by adding {}.
   */
  handleInfixNodes(body) {
      let overIndex = -1;
      let funcName;

      for (let i = 0; i < body.length; i++) {
          const node = checkNodeType(body[i], "infix");
          if (node) {
              if (overIndex !== -1) {
                  throw new SyntaxError(
                      "only one infix operator per group",
                      node.token);
              }
              overIndex = i;
              funcName = node.replaceWith;
          }
      }

      if (overIndex !== -1 && funcName) {
          let numerNode;
          let denomNode;

          const numerBody = body.slice(0, overIndex);
          const denomBody = body.slice(overIndex + 1);

          if (numerBody.length === 1 && numerBody[0].type === "ordgroup") {
              numerNode = numerBody[0];
          } else {
              numerNode = {type: "ordgroup", mode: this.mode, body: numerBody};
          }

          if (denomBody.length === 1 && denomBody[0].type === "ordgroup") {
              denomNode = denomBody[0];
          } else {
              denomNode = {type: "ordgroup", mode: this.mode, body: denomBody};
          }

          let node;
          if (funcName === "\\\\abovefrac") {
              node = this.callFunction(funcName,
                  [numerNode, body[overIndex], denomNode], []);
          } else {
              node = this.callFunction(funcName, [numerNode, denomNode], []);
          }
          return [node];
      } else {
          return body;
      }
  }

}

Object.assign(
  Parser.prototype,
  require('./advance'),
)

Parser.endOfExpression = ["}", "\\endgroup", "\\end", "\\right", "&"];

Parser.endOfGroup = {
    "[": "]",
    "{": "}",
    "\\begingroup": "\\endgroup",
}

Parser.SUPSUB_GREEDINESS = 1;

const parseTree = function(input, settings) {
    const parser = new Parser(input, settings);
    return parser.parse();
};

module.exports = {Parser, parseTree}
