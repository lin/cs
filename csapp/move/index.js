const consts = {

  bo: 0x000000ff,
  bz: 0xffffff00,

  wo: 0x0000ffff,
  wz: 0xffff0000,

  lo: 0xffffffff,
  lz: 0x00000000,

}

const sizeMap = {
  'b': 1,
  'w': 2,
  'l': 4
}

function mov (s, d, size) {
  const o = consts[size + 'o']
  const z = consts[size + 'z']

  return (s & o) | (d & z)
}

function movsz (s, d, ssize, dsize, isSign) {
  // 64 is for javascript
  let movement =  64 - sizeMap.ssize * 8
  let extended = isSign
               ? (s << movement) >>  movement
               : (s << movement) >>> movement

  return mov(extended, d, dsize)
}

function factory () {
  let r = {}
  let sizes = ['b', 'w', 'l']

  sizes.forEach((size) => {
    r['mov' + size] = (s, d) => mov(s, d, size)

    for (let s in sizeMap) {
      if (sizeMap[size] < sizeMap[s]) {
        r['movs' + size + s] = (s, d) => movsz(s, d, size, s, true /* sign */)
        r['movz' + size + s] = (s, d) => movsz(s, d, size, s, false /* zero */)
      }
    }

  })

  return r
}

module.exports = factory()
