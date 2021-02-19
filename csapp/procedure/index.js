const Parser = require('./Parser')

const format = n => '0x' + n.toString(16)

// populate a memory segment
let memory = (function(){
  const memory = []
  const startPos = 0x800060

  for (var i = 0; i < 50; i++) {
    memory[startPos - i * 4] = 0
  }
  return memory
})()

// use case: logMemory(0x800040, 5)
const logMemory = function (start, len) {
  for (var i = 0; i < len; i++) {
    let address = start - 4 * i
    console.log(format(address) + ': ' + memory[address]);
  }
}

const sizeMap = {
  'short': 16,
  'int': 32,
  'char': 8,
  'pointer': 32
}

class FunctionCall  {

  constructor (input) {
    this.ebp = 0x800060
    this.esp = 0x800040
    this.input = input
    this.argSymbolTable = []
    this.setup()
  }

  setup () {
    let func = (new Parser(this.input)).parse()
    this.functioName = func.functionName
    this.setupArgSymbolTable(func.params)
    this.setupArg()
    this.push('RETURN ADDRESS')
    this.ebp = this.esp
  }

  setupArgSymbolTable (params) {
    for (var i = 0; i < params.length; i++) {
      let param = params[i]
      this.argSymbolTable.push({
        id: param.id,
        type: param.dataType.dataType,
        isPtr: param.dataType.isPtr
      })
    }
  }

  setupArg () {
    let pos = this.esp
    for (var i = 0; i < this.argSymbolTable.length; i++) {
      let offset = this.getArgOffset(this.argSymbolTable[i])
      pos += offset
      memory[pos] = this.argSymbolTable[i].value
    }
  }

  getArgOffset (arg) {
    let dataType = arg.isPtr ? 'pointer' : arg.type
    return sizeMap[dataType] / 8
  }

  getArgAddress (n) {
    let pos = 0
    for (var i = 0; i <= n; i++) {
      let offset = this.getArgOffset(this.argSymbolTable[i])
      pos += offset
    }
    return this.ebp + pos + 4
  }

  getArgValue (n) {
    return memory[getArgAddress(n)]
  }

  push (val) {
    memory[this.esp] = val
    this.esp += 4
  }

}
