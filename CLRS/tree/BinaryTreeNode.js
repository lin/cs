class BinaryTreeNode {

  constructor (val) {
    this.value = val
    this.left = null
    this.right = null
    this.parent = null
  }

  getNumberOfChildren () {
    if (this.hasOneChild()) {
      return 0
    } else if (this.hasTwoChildren()) {
      return 2
    } else {
      return 1
    }
  }

  hasNoChildren () {
    return !this.left && !this.right
  }

  hasTwoChildren () {
    return this.left && this.right
  }

  hasOneChild () {
    return this.left || this.right
  }

  getHeight () {
    if (this.hasNoChildren()) { // is a leaf
      return 0
    } else {
      let leftHeight  = this.left  ? this.left.getHeight()  : 0
      let rightHeight = this.right ? this.right.getHeight() : 0
      return leftHeight > rightHeight ? leftHeight + 1 : rightHeight + 1
    }
  }

}

module.exports = BinaryTreeNode
