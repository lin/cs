## Hard Part about Babel Parser

### noIn

This is what means for noIn:

Not OK to say: `for (a in b;;) {}`
All other expressions are fit for the first position.
So a single lookahead is hard to tell the difference.

### refShorthandDefaultPos

This is what means for it:
`let {a, b = 3} = {a: 1}`
 or
`x = {a, b}`
 or
`function func({ a, b = 3}) {}`


So `{a, b = 3}` can be interpreted `{ expr -> exprList -> id, Assignment -> id, id = literal }`

And `x = {a, b}` can be interpreted as `{ expr -> exprList -> id, id }`

The complexity is that it's hard to distinguish `{}` with statement blocks and object.
At the same time, `=` is also what we expect for `AssignmentExpression`.

`c = {a, b = 3} = {}` works, while `c = {a, b = 3}` doesn't.

### Statement

Core grammar:

```
// things are allowed in top level, but not single statement in context
top_level -> block_body EOF
block_body -> Statements | BlockStatement
Statements -> Statement | Statements Statement ->
  do | for | function | if | return | // blah blah
  try | var | while | BlockStatement
BlockStatement -> { block_body }
```
