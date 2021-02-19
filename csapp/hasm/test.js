const tokenizer = require('./tokenizer')
const translate = require('./translate')

let commands = [
  '%eax',
  // '0x104',
  // '(%eax)',
  // '(%eax, %edx)',
  // '9(%eax)',
  // '9(%eax, %edx, 4)',
  // '9(, %edx, 4)'
]

for (var i = 0; i < commands.length; i++) {
  let result = translate(
    tokenizer(commands[i])
  )
}
