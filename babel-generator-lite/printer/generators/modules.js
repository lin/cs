module.exports = {

ImportSpecifier(node) {
  if (node.importKind === "type" || node.importKind === "typeof") {
    this.word(node.importKind);
    this.space();
  }

  this.print(node.imported, node);
  if (node.local && node.local.name !== node.imported.name) {
    this.space();
    this.word("as");
    this.space();
    this.print(node.local, node);
  }
},

ImportDefaultSpecifier(node) {
  this.print(node.local, node);
},

ExportDefaultSpecifier(node) {
  this.print(node.exported, node);
},

ExportSpecifier(node) {
  this.print(node.local, node);
  if (node.exported && node.local.name !== node.exported.name) {
    this.space();
    this.word("as");
    this.space();
    this.print(node.exported, node);
  }
},

ExportNamespaceSpecifier(node) {
  this.token("*");
  this.space();
  this.word("as");
  this.space();
  this.print(node.exported, node);
},

ExportAllDeclaration(node) {
  this.word("export");
  this.space();
  if (node.exportKind === "type") {
    this.word("type");
    this.space();
  }
  this.token("*");
  this.space();
  this.word("from");
  this.space();
  this.print(node.source, node);
  this.semicolon();
},

ExportNamedDeclaration(node) {
  this.word("export");
  this.space();
  ExportDeclaration.apply(this, arguments);
},

ExportDefaultDeclaration(node) {
  this.word("export");
  this.space();
  this.word("default");
  this.space();
  ExportDeclaration.apply(this, arguments);
},

ImportDeclaration(node) {
  this.word("import");
  this.space();

  if (node.importKind === "type" || node.importKind === "typeof") {
    this.word(node.importKind);
    this.space();
  }

  const specifiers = node.specifiers.slice(0);
  if (specifiers && specifiers.length) {
    if (specifiers.length) {
      this.token("{");
      this.space();
      this.printList(specifiers, node);
      this.space();
      this.token("}");
    }

    this.space();
    this.word("from");
    this.space();
  }

  this.print(node.source, node);
  this.semicolon();
},

ImportNamespaceSpecifier(node) {
  this.token("*");
  this.space();
  this.word("as");
  this.space();
  this.print(node.local, node);
},

} // end exports

function ExportDeclaration(node) {

  if (node.declaration) {
    const declar = node.declaration;
    this.print(declar, node);
  } else {
    if (node.exportKind === "type") {
      this.word("type");
      this.space();
    }

    const specifiers = node.specifiers.slice(0);

    if (specifiers.length || (!specifiers.length)) {
      this.token("{");
      if (specifiers.length) {
        this.space();
        this.printList(specifiers, node);
        this.space();
      }
      this.token("}");
    }

    if (node.source) {
      this.space();
      this.word("from");
      this.space();
      this.print(node.source, node);
    }

    this.semicolon();
  }
}
