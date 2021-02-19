
module.exports = function format (binary) {

  let bitSize = 16
  let result = (binary >>> 0).toString(2)

  let delta = bitSize - result.length

  if (delta > 0) {
    return Array(delta).fill('0').join('') + result
  } else {
    return result.substring(-bitSize)
  }

}
