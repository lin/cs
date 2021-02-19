/* http://www.opensource.apple.com/source/JavaScriptCore/ */

%start Program

%nonassoc IF_WITHOUT_ELSE
%nonassoc ELSE

%%

//========================//
//========================//
//=====  EXPR ATOMS  =====//
//========================//
//========================//

Literal
    : NUMBER // 123
    | STRING // 'hello'
    ;

Property // objecte property and method
    : IDENT ':' AssignmentExpr // id:
    | IDENT '(' FormalParameterList ')' OPENBRACE FunctionBody CLOSEBRACE
    ;

PropertyList // object property list
    : Property
    | PropertyList ',' Property
    ;

ObjectExpr // normal expr, and expr with { object property list }
    : OPENBRACE CLOSEBRACE // {}
    | OPENBRACE PropertyList CLOSEBRACE // { property, property, ... property }
    | OPENBRACE PropertyList ',' CLOSEBRACE // { property, property, ... property, }
    ;

PrimaryExpr // normal expr
    : THISTOKEN // this
    | Literal
    | ArrayLiteral // [a, b, c]
    | IDENT // id x y z
    | '(' Expr ')' // ( expr )
    ;

ArrayLiteral
    : '[' ']'
    | '[' ElementList ']'
    ;

ElementList
    : AssignmentExpr
    | ElementList ',' AssignmentExpr
    ;

//========================//
//========================//
//=====  EXPRESSION  =====//
//========================//
//========================//

MemberExpr // parseExprSubscripts
    : PrimaryExpr // expr
    | FunctionExpr
    | MemberExpr '[' Expr ']'  // expr[expr][expr] {}[]
    | MemberExpr '.' IDENT //  expr.id.id.id
    | NEW MemberExpr Arguments // new Albert.Lin()
    ;

NewExpr // parseExprSubscripts
    : MemberExpr
    | NEW NewExpr
    ;

CallExpr // parseExprSubscripts
    : MemberExpr Arguments
    | CallExpr Arguments
    | CallExpr '[' Expr ']'
    | CallExpr '.' IDENT
    ;

//===== ARGS =====//

Arguments
    : '(' ')'
    | '(' ArgumentList ')'
    ;

ArgumentList
    : AssignmentExpr
    | ArgumentList ',' AssignmentExpr
    ;

// Not sure about this
LeftHandSideExpr
    : MemberExpr
    | CallExpr // not right for a.x()
    ;

//========================//
//========================//
//=====  OPERATIONS  =====//
//========================//
//========================//


//===== UNARY =====//

// Unary with postfix, only ++ / --
PostfixExpr // parseMaybeUnary
    : LeftHandSideExpr
    | LeftHandSideExpr PLUSPLUS
    | LeftHandSideExpr MINUSMINUS
    ;

// Unary with prefix
UnaryExprCommon // parseMaybeUnary
    : DELETETOKEN UnaryExpr
    | VOIDTOKEN UnaryExpr
    | '+' UnaryExpr
    | '-' UnaryExpr
    ;

// Unary = prefix + postfix
UnaryExpr // parseMaybeUnary
    : PostfixExpr
    | UnaryExprCommon
    ;

//===== BINARY =====//

AdditiveExpr // parseExprOps
    : MultiplicativeExpr
    | AdditiveExpr '+' MultiplicativeExpr
    | AdditiveExpr '-' MultiplicativeExpr
    ;

RelationalExpr // parseExprOps
    : ShiftExpr
    | RelationalExpr '<' ShiftExpr
    | RelationalExpr '>' ShiftExpr
    | RelationalExpr LE ShiftExpr
    | RelationalExpr GE ShiftExpr
    | RelationalExpr INSTANCEOF ShiftExpr
    | RelationalExpr INTOKEN ShiftExpr
    ;

// No In is start here.
// in can work as a relational expression
// also for ( a in b)
// which cause the trouble
RelationalExprNoIn // no in start here that no in is allowed here
    : ShiftExpr
    | RelationalExprNoIn '<' ShiftExpr
    | RelationalExprNoIn '>' ShiftExpr
    | RelationalExprNoIn LE ShiftExpr
    | RelationalExprNoIn GE ShiftExpr
    | RelationalExprNoIn INSTANCEOF ShiftExpr
    ;

BitwiseANDExpr // parseExprOps
    : EqualityExpr
    | BitwiseANDExpr '&' EqualityExpr
    ;

//===== Conditional =====//

ConditionalExpr // parseMaybeConditional
    : LogicalORExpr // parseExprOps
    | LogicalORExpr '?' AssignmentExpr ':' AssignmentExpr
    ;

//===== Assignment =====//

AssignmentExpr // parseMaybeAssign
    : ConditionalExpr
    | LeftHandSideExpr AssignmentOperator AssignmentExpr
    ;

AssignmentOperator
    : '='
    | PLUSEQUAL
    ;

//===== Assignments =====//

Expr // Assignments
    : AssignmentExpr
    | Expr ',' AssignmentExpr
    ;

//========================//
//========================//
//=====  STATEMENTS  =====//
//========================//
//========================//

Statement
    : Block
    | VariableStatement
    | ConstStatement
    | FunctionDeclaration
    | EmptyStatement
    | ExprStatement
    | IfStatement
    | IterationStatement
    | ContinueStatement
    | BreakStatement
    | ReturnStatement
    | WithStatement
    | SwitchStatement
    | LabelledStatement
    | ThrowStatement
    | TryStatement
    | DebuggerStatement
    ;

Block
    : OPENBRACE CLOSEBRACE
    | OPENBRACE Statements CLOSEBRACE
    ;

VariableStatement
    : VAR VariableDeclarationList ';'
    | VAR VariableDeclarationList error
    ;

VariableDeclarationList
    : IDENT
    | IDENT Initializer
    | VariableDeclarationList ',' IDENT
    | VariableDeclarationList ',' IDENT Initializer
    ;

ConstStatement
    : CONSTTOKEN ConstDeclarationList ';'
    | CONSTTOKEN ConstDeclarationList error
    ;

ConstDeclarationList
    : ConstDeclaration
    | ConstDeclarationList ',' ConstDeclaration
    ;

ConstDeclaration
    : IDENT
    | IDENT Initializer
    ;

Initializer
    : '=' AssignmentExpr
    ;


EmptyStatement
    : ';'
    ;

// another root of evil
// ExprNoBF is just for here
// as long as its not for ExprStatement
// object is a valid expr
ExprStatement
    : Expr ';'
    | Expr error
    ;

IfStatement
    : IF '(' Expr ')' Statement %prec IF_WITHOUT_ELSE
    | IF '(' Expr ')' Statement ELSE Statement
    ;

IterationStatement
    : DO Statement WHILE '(' Expr ')' ';'
    | DO Statement WHILE '(' Expr ')' error
    | WHILE '(' Expr ')' Statement
    // the root of all evil
    | FOR '(' ExprNoInOpt ';' ExprOpt ';' ExprOpt ')' Statement
    | FOR '(' VAR VariableDeclarationListNoIn ';' ExprOpt ';' ExprOpt ')' Statement
    | FOR '(' LeftHandSideExpr INTOKEN Expr ')' Statement
    | FOR '(' VAR IDENT INTOKEN Expr ')' Statement
    | FOR '(' VAR IDENT InitializerNoIn INTOKEN Expr ')' Statement
    ;

ExprOpt
    :
    | Expr
    ;

ContinueStatement
    : CONTINUE ';'
    | CONTINUE error
    | CONTINUE IDENT ';'
    | CONTINUE IDENT error
    ;

BreakStatement
    : BREAK ';'
    | BREAK error
    | BREAK IDENT ';'
    | BREAK IDENT error
    ;

ReturnStatement
    : RETURN ';'
    | RETURN error
    | RETURN Expr ';'
    | RETURN Expr error
    ;

SwitchStatement
    : SWITCH '(' Expr ')' CaseBlock
    ;

CaseBlock
    : OPENBRACE CaseClausesOpt CLOSEBRACE
    | OPENBRACE CaseClausesOpt DefaultClause CaseClausesOpt CLOSEBRACE
    ;

CaseClausesOpt
    :
    | CaseClauses
    ;

CaseClauses
    : CaseClause
    | CaseClauses CaseClause
    ;

CaseClause
    : CASE Expr ':'
    | CASE Expr ':' Statements
    ;

DefaultClause
    : DEFAULT ':'
    | DEFAULT ':' Statements
    ;

LabelledStatement
    : IDENT ':' Statement
    ;

ThrowStatement
    : THROW Expr ';'
    | THROW Expr error
    ;

TryStatement
    : TRY Block FINALLY Block
    | TRY Block CATCH '(' IDENT ')' Block
    | TRY Block CATCH '(' IDENT ')' Block FINALLY Block
    ;

FunctionDeclaration
    : FUNCTION IDENT '(' ')' OPENBRACE FunctionBody CLOSEBRACE
    | FUNCTION IDENT '(' FormalParameterList ')' OPENBRACE FunctionBody CLOSEBRACE
    ;

FunctionExpr
    : FUNCTION '(' ')' OPENBRACE FunctionBody CLOSEBRACE
    | FUNCTION '(' FormalParameterList ')' OPENBRACE FunctionBody CLOSEBRACE
    | FUNCTION IDENT '(' ')' OPENBRACE FunctionBody CLOSEBRACE
    | FUNCTION IDENT '(' FormalParameterList ')' OPENBRACE FunctionBody CLOSEBRACE
    ;

FormalParameterList
    : IDENT
    | FormalParameterList ',' IDENT
    ;

FunctionBody
    :
    | Statements
    ;

Program
    :
    | Statements
    ;


//========================//
//========================//
//=====  STATEMENTS  =====//
//========================//
//========================//

Statements
    : Statement
    | Statements Statement
    ;
