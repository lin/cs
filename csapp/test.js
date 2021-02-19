const {movb} = require('./move')
const format = require('./move/format')

let d = 0xaaaa // 1010 1010 1010 1010
let s = 0x5555 // 0101 0101 0101 0101

console.log(format(movb(s, d)))

const tokenizer = require('./operand/tokenizer')
const translate = require('./operand/translate')

let commands = [
  '%eax',
  '0x104',
  '(%eax)',
  '(%eax, %edx)',
  '9(%eax)',
  '9(%eax, %edx, 4)',
  '9(, %edx, 4)'
]

for (var i = 0; i < commands.length; i++) {
  let result = translate(
    tokenizer(commands[i])
  )
}
