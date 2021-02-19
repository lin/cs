const {functions}          =  require("./functions");
// const Settings = require("./Settings");

const MacroExpander        = require("./MacroExpander").MacroExpander;
const implicitCommands     = require("./MacroExpander").implicitCommands;
const symbols              = require("./symbols").symbols;
const ATOMS                = require("./symbols").ATOMS;
const extraLatin           = require("./symbols").extraLatin;
const validUnit            = require("./units").validUnit;
const supportedCodepoint   = require("./unicodeScripts").supportedCodepoint;
const unicodeAccents       = require("./unicodeAccents").unicodeAccents;
const unicodeSymbols       = require("./unicodeSymbols").unicodeSymbols;
const utils                = require("./utils").utils;
const checkNodeType        = require("./parseNode").checkNodeType;
const combiningDiacriticalMarksEndRegex
                           = require("./Lexer").combiningDiacriticalMarksEndRegex;
const SourceLocation       = require("./SourceLocation").SourceLocation;
const Token                = require("./Token").Token;

class Parser {

  constructor(input, settings) {
  }

  parse() {
    this.consume();
    return this.parseExpression(false);
  }

  consume() {
      this.nextToken = this.gullet.expandNextToken();
  }

  parseExpression(breakOnInfix, breakOnTokenText) {
      const body = [];
      while (true) {
          body.push(this.parseAtom(breakOnTokenText));
      }
      return body
  }

  parseAtom() {
      const base = this.parseGroup("atom", false, null, breakOnTokenText);

      let superscript;
      let subscript;
      while (true) {
          const lex = this.nextToken;

         if (lex.text === "^") {
              superscript = this.handleSupSubscript("superscript");
          } else if (lex.text === "_") {
              subscript = this.handleSupSubscript("subscript");
          } else {
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


  parseGroup(
      name,
      optional,
      greediness,
      breakOnTokenText,
      mode
  ) {
      const firstToken = this.nextToken;
      const text = firstToken.text;

      if (text === "{") {
          this.consume();
          const expression = this.parseExpression(false, groupEnd);
          const lastToken = this.nextToken;
          result = {
              type: "ordgroup",
              mode: this.mode,
              loc: SourceLocation.range(firstToken, lastToken),
              body: expression,
          };
      } else {
          result = this.parseFunction(breakOnTokenText, name, greediness) ||
              this.parseSymbol();
      }

      return result;
  }

  parseFunction(
      breakOnTokenText, // } \endgroup
      name, // For error reporting.
      greediness
  ) {
      const token = this.nextToken;
      const func = token.text;
      const funcData = functions[func];

      if (!funcData) return null;

      this.consume();
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
          if (i > 0 && !isOptional) {
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
              throw new ParseError(`\\verb assertion failed --
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
          // if (this.settings.strict && this.mode === 'math' &&
          //     extraLatin.indexOf(text) >= 0) {
          //     this.settings.reportNonstrict("unicodeTextInMathMode",
          //         `Latin-1/Unicode text character "${text[0]}" used in ` +
          //         `math mode`, nucleus);
          // }
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
          // if (this.settings.strict) {
          //     if (!supportedCodepoint(text.charCodeAt(0))) {
          //         this.settings.reportNonstrict("unknownSymbol",
          //             `Unrecognized Unicode character "${text[0]}"` +
          //             ` (${text.charCodeAt(0)})`, nucleus);
          //     } else if (this.mode === "math") {
          //         this.settings.reportNonstrict("unicodeTextInMathMode",
          //             `Unicode text character "${text[0]}" used in math mode`,
          //             nucleus);
          //     }
          // }

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
                  throw new ParseError(`Unknown accent ' ${accent}'`, nucleus);
              }
              const command = unicodeAccents[accent][this.mode];
              if (!command) {
                  throw new ParseError(
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
                  throw new ParseError("Expected raw group", this.nextToken);
              }
          }
          case "original":
          case null:
          case undefined:
              return this.parseGroup(name, optional, greediness);
          default:
              throw new ParseError(
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
          throw new ParseError("Invalid color: '" + res.text + "'", res);
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
          throw new ParseError("Invalid size: '" + res.text + "'", res);
      }
      const data = {
          number: +(match[1] + match[2]), // sign + magnitude, cast to number
          unit: match[3],
      };
      if (!validUnit(data)) {
          throw new ParseError("Invalid unit: '" + data.unit + "'", res);
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
      //     throw new ParseError(
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
                  throw new ParseError(
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
          throw new ParseError(
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
      //     throw new ParseError(
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
                  throw new ParseError(
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

Parser.endOfExpression = ["}", "\\endgroup", "\\end", "\\right", "&"];

Parser.endOfGroup = {
    "[": "]",
    "{": "}",
    "\\begingroup": "\\endgroup",
}

Parser.SUPSUB_GREEDINESS = 1;

module.exports = {Parser}
