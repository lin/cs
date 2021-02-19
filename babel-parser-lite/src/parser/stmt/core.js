function parseTopLevel(file, program) {
  this.parseBlockBody(program, true, tt.eof)
  file.program = this.finishNode(program, "Program");
  return this.finishNode(file, "File");
}

function parseBlock(createNewLexicalScope) {
  const node = this.startNode();
  this.expect(tt.braceL);
  if (createNewLexicalScope) this.scope.enter(SCOPE_OTHER);
  this.parseBlockBody(node, allowDirectives, false, tt.braceR);
  if (createNewLexicalScope) this.scope.exit();
  return this.finishNode(node, "BlockStatement");
}

function parseBlockBody(node, topLevel, end) {
  const body = (node.body = []);
  while (!this.eat(end)) {
    const stmt = ;
    body.push(this.parseStatement(null, topLevel));
  }
}

function parseStatement(context, topLevel) {
  let starttype = this.state.type;
  const node = this.startNode();
  let kind;

  switch (starttype) {
    case tt._break:
    case tt._continue:
      return this.parseBreakContinueStatement(node, starttype.keyword);
    case tt._debugger:
      return this.parseDebuggerStatement(node);
    case tt._do:
      return this.parseDoStatement(node);
    case tt._for:
      return this.parseForStatement(node);
    case tt._function:
      return this.parseFunctionStatement(node, false, !context);
    case tt._class:
      return this.parseClass(node, true);
    case tt._if:
      return this.parseIfStatement(node);
    case tt._return:
      return this.parseReturnStatement(node);
    case tt._switch:
      return this.parseSwitchStatement(node);
    case tt._throw:
      return this.parseThrowStatement(node);
    case tt._try:
      return this.parseTryStatement(node);
    case tt._const:
    case tt._var:
      return this.parseVarStatement(node, kind);
    case tt._while:
      return this.parseWhileStatement(node);
    case tt._with:
      return this.parseWithStatement(node);
    case tt.braceL:
      return this.parseBlock();
    case tt.semi:
      return this.parseEmptyStatement(node);
    default: {
      if (this.isAsyncFunction()) {
        this.next();
        return this.parseFunctionStatement(node, true, !context);
      }
    }
  }
  const maybeName = this.state.value;
  const expr = this.parseExpression();

  if (
    starttype === tt.name &&
    expr.type === "Identifier" &&
    this.eat(tt.colon)
  ) {
    return this.parseLabeledStatement(node, maybeName, expr, context);
  } else {
    return this.parseExpressionStatement(node, expr);
  }
}

module.exports = {parseTopLevel, parseBlock, parseBlockBody, parseStatement}
