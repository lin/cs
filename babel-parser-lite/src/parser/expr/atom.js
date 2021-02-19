parseExprAtom(refShorthandDefaultPos) {
  // If a division operator appears in an expression position, the
  // tokenizer got confused, and we force it to read a regexp instead.
  if (this.state.type === tt.slash) this.readRegexp();

  let node;

  switch (this.state.type) {
    case tt._this:
      node = this.startNode();
      this.next();
      return this.finishNode(node, "ThisExpression");

    case tt.name: {
      node = this.startNode();
      const containsEsc = this.state.containsEsc;
      const id = this.parseIdentifier();

      if (
        !containsEsc &&
        id.name === "async" &&
        this.match(tt._function) &&
        !this.canInsertSemicolon()
      ) {
        this.next();
        return this.parseFunction(node, undefined, true);
      }

      return id;
    }

    case tt.regexp: {
      const value = this.state.value;
      node = this.parseLiteral(value.value, "RegExpLiteral");
      node.pattern = value.pattern;
      node.flags = value.flags;
      return node;
    }

    case tt.num:
      return this.parseLiteral(this.state.value, "NumericLiteral");

    case tt.bigint:
      return this.parseLiteral(this.state.value, "BigIntLiteral");

    case tt.string:
      return this.parseLiteral(this.state.value, "StringLiteral");

    case tt._null:
      node = this.startNode();
      this.next();
      return this.finishNode(node, "NullLiteral");

    case tt._true:
    case tt._false:
      return this.parseBooleanLiteral();

    case tt.parenL:
      return this.parseParenAndDistinguishExpression(canBeArrow);

    case tt.bracketL:
      node = this.startNode();
      this.next();
      node.elements = this.parseExprList(
        tt.bracketR,
        true,
        refShorthandDefaultPos,
      );
      return this.finishNode(node, "ArrayExpression");

    case tt.braceL:
      return this.parseObj(false, refShorthandDefaultPos);

    case tt._function:
      return this.parseFunctionExpression();

    case tt._new:
      return this.parseNew();

    default:
      throw this.unexpected();
  }
}

parseParenAndDistinguishExpression() {
  const startPos = this.state.start;
  const startLoc = this.state.startLoc;

  this.expect(tt.parenL);

  const innerStartPos = this.state.start;
  const innerStartLoc = this.state.startLoc;
  const exprList = [];
  const  = { start: 0 };
  const refNeedsArrowPos = { start: 0 };
  let first = true;
  let spreadStart;
  let optionalCommaStart;

  while (!this.match(tt.parenR)) {
    if (first) {
      first = false;
    } else {
      this.expect(tt.comma);
    }

    if (this.match(tt.ellipsis)) {
      const spreadNodeStartPos = this.state.start;
      const spreadNodeStartLoc = this.state.startLoc;
      spreadStart = this.state.start;
      exprList.push(this.parseRestBinding());
      break;
    } else {
      exprList.push(
        this.parseMaybeAssign(
          false,
          ,
          this.parseParenItem,
          refNeedsArrowPos,
        ),
      );
    }
  }

  if (exprList.length > 1) {
    val = this.startNodeAt(innerStartPos, innerStartLoc);
    val.expressions = exprList;
    this.finishNodeAt(val, "SequenceExpression", innerEndPos, innerEndLoc);
  } else {
    val = exprList[0];
  }

  const parenExpression = this.startNodeAt(startPos, startLoc);
  parenExpression.expression = val;
  this.finishNode(parenExpression, "ParenthesizedExpression");
  return parenExpression;
}
