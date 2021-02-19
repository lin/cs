

module.exports = {

  UnaryExpression(node) {
    if (
      node.operator === "void" ||
      node.operator === "delete" ||
      node.operator === "typeof" ||
      // throwExpressions
      node.operator === "throw"
    ) {
      this.word(node.operator);
      this.space();
    } else {
      this.token(node.operator);
    }

    this.print(node.argument, node);
  },

  DoExpression(node) {
    this.word("do");
    this.space();
    this.print(node.body, node);
  },

  UpdateExpression(node) {
    if (node.prefix) {
      this.token(node.operator);
      this.print(node.argument, node);
    } else {
      this.print(node.argument, node);
      this.token(node.operator);
    }
  },

  ConditionalExpression(node) {
    this.print(node.test, node);
    this.space();
    this.token("?");
    this.space();
    this.print(node.consequent, node);
    this.space();
    this.token(":");
    this.space();
    this.print(node.alternate, node);
  },

  NewExpression(node, parent) {
    this.word("new");
    this.space();
    this.print(node.callee, node);
    this.token("(");
    this.printList(node.arguments, node);
    this.token(")");
  },

  SequenceExpression(node) {
    this.printList(node.expressions, node);
  },

  ParenthesizedExpression(node) {
    this.token("(");
    this.print(node.expression, node);
    this.token(")");
  },

  ExpressionStatement (node) {
    this.print(node.expression, node);
    this.token(';')
  },

  AssignmentExpression(node, parent) {

    this.print(node.left, node);

    this.space();

    if (node.operator === "in" || node.operator === "instanceof") {
      this.word(node.operator);
    } else {
      this.token(node.operator);
    }
    this.space();

    this.print(node.right, node);

  },

  BinaryExpression (node) {
    this.AssignmentExpression(node)
  },

  LogicalExpression (node) {
    this.AssignmentExpression(node)
  },

  ThisExpression() {
    this.word("this");
  },

  Super() {
    this.word("super");
  },

  CallExpression(node) {
    this.print(node.callee, node);
    this.token("(");
    this.printList(node.arguments, node);
    this.token(")");
  },

  Import() {
    this.word("import");
  },

  EmptyStatement () {
    this.semicolon(true);
  },

  ExpressionStatement(node) {
   this.print(node.expression, node);
   this.semicolon();
 },


 AssignmentPattern(node) {
   this.print(node.left, node)
   this.space()
   this.token("=")
   this.space()
   this.print(node.right, node)
 },

 MemberExpression(node) {
   this.print(node.object, node);

   let computed = node.computed;

   if (computed) {
     this.token("[");
     this.print(node.property, node);
     this.token("]");
   } else {
     this.token(".");
     this.print(node.property, node);
   }
 },

 MetaProperty(node) {
   this.print(node.meta, node);
   this.token(".");
   this.print(node.property, node);
 },

 PrivateName(node) {
   this.token("#");
   this.print(node.id, node);
 },

}
