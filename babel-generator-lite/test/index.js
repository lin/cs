let parser = require('@babel/parser')
let t = require('@babel/types')
let generator = require('../index')

let code = 'let foo = "bar", bar = "foo";'
let ast = parser.parse(code)

console.log( generator(ast) )
