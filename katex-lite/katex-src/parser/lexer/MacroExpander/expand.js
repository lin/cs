const Token = require('../Token')

module.exports = {
  consumeArgs(numArgs){
      const args = [];
      // obtain arguments, either single token or balanced {…} group
      for (let i = 0; i < numArgs; ++i) {
          this.consumeSpaces();  // ignore spaces before each argument
          const startOfArg = this.popToken();
          if (startOfArg.text === "{") {
              const arg = [];
              let depth = 1;
              while (depth !== 0) { // equal numbers of { and }
                  const tok = this.popToken();
                  arg.push(tok);
                  if (tok.text === "{") {
                      ++depth;
                  } else if (tok.text === "}") {
                      --depth;
                  }
              }
              arg.pop(); // remove last }
              arg.reverse(); // like above, to fit in with stack order
              args[i] = arg;
          } else {
              args[i] = [startOfArg];
          }
      }
      return args;
  },

  expandOnce() {
      const topToken = this.popToken();
      const name = topToken.text;
      const expansion = this._getExpansion(name);
      if (expansion == null) {
          this.pushToken(topToken);
          return topToken;
      }
      this.expansionCount++;
      let tokens = expansion.tokens;
      if (expansion.numArgs) {
          const args = this.consumeArgs(expansion.numArgs);
          // paste arguments in place of the placeholders
          tokens = tokens.slice(); // make a shallow copy
          for (let i = tokens.length - 1; i >= 0; --i) {
              let tok = tokens[i];
              if (tok.text === "#") {
                  if (i === 0) {
                      // throw new ParseError(
                      //     "Incomplete placeholder at end of macro body",
                      //     tok);
                  }
                  tok = tokens[--i]; // next token on stack
                  if (tok.text === "#") { // ## → #
                      tokens.splice(i + 1, 1); // drop first #
                  } else if (/^[1-9]$/.test(tok.text)) {
                      // replace the placeholder with the indicated argument
                      tokens.splice(i, 2, ...args[+tok.text - 1]);
                  } else {
                      // throw new ParseError(
                      //     "Not a valid argument number",
                      //     tok);
                  }
              }
          }
      }
      // Concatenate expansion onto top of stack.
      this.pushTokens(tokens);
      return tokens;
  },

  /**
   * Expand the next token only once (if possible), and return the resulting
   * top token on the stack (without removing anything from the stack).
   * Similar in behavior to TeX's `\expandafter\futurelet`.
   * Equivalent to expandOnce() followed by future().
   */
  expandAfterFuture() {
      this.expandOnce();
      return this.future();
  },

  /**
   * Recursively expand first token, then return first non-expandable token.
   */
  expandNextToken() {
      for (;;) {
          const expanded = this.expandOnce();
          // expandOnce returns Token if and only if it's fully expanded.
          if (expanded instanceof Token) {
              // \relax stops the expansion, but shouldn't get returned (a
              // null return value couldn't get implemented as a function).
              if (expanded.text === "\\relax") {
                  this.stack.pop();
              } else {
                  return this.stack.pop();  // === expanded
              }
          }
      }

      // Flow unable to figure out that this pathway is impossible.
      // https://github.com/facebook/flow/issues/4808
      throw new Error(); // eslint-disable-line no-unreachable
  },

  /**
   * Fully expand the given macro name and return the resulting list of
   * tokens, or return `undefined` if no such macro is defined.
   */
  expandMacro(name) {
      if (!this.macros.get(name)) {
          return undefined;
      }
      const output = [];
      const oldStackLength = this.stack.length;
      this.pushToken(new Token(name));
      while (this.stack.length > oldStackLength) {
          const expanded = this.expandOnce();
          // expandOnce returns Token if and only if it's fully expanded.
          if (expanded instanceof Token) {
              output.push(this.stack.pop());
          }
      }
      return output;
  },

  /**
   * Fully expand the given macro name and return the result as a string,
   * or return `undefined` if no such macro is defined.
   */
  expandMacroAsText(name) {
      const tokens = this.expandMacro(name);
      if (tokens) {
          return tokens.map((token) => token.text).join("");
      } else {
          return tokens;
      }
  },

  /**
   * Returns the expanded macro as a reversed array of tokens and a macro
   * argument count.  Or returns `null` if no such macro.
   */
  _getExpansion(name) {
      const definition = this.macros.get(name);
      if (definition == null) { // mainly checking for undefined here
          return definition;
      }
      const expansion =
          typeof definition === "function" ? definition(this) : definition;
      if (typeof expansion === "string") {
          let numArgs = 0;
          if (expansion.indexOf("#") !== -1) {
              const stripped = expansion.replace(/##/g, "");
              while (stripped.indexOf("#" + (numArgs + 1)) !== -1) {
                  ++numArgs;
              }
          }
          const bodyLexer = new Lexer(expansion, {});
          const tokens = [];
          let tok = bodyLexer.lex();
          while (tok.text !== "EOF") {
              tokens.push(tok);
              tok = bodyLexer.lex();
          }
          tokens.reverse(); // to fit in with stack using push and pop
          const expanded = {tokens, numArgs};
          return expanded;
      }

      return expansion;
  },
}
