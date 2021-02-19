const BinaryTreeNode = require('./BinaryTreeNode')

class BinarySearchTree {
  constructor (node) {
    this.root = node
  }

  addNode (node) {
    if (!this.root) {
      this.root = node
    } else {
      let currentNode = this.root
      while (currentNode) {
        if (currentNode.value > node.value) {
          if (currentNode.left) {
            currentNode = currentNode.left
          } else {
            currentNode.left = node
            node.parent = currentNode
            break
          }
        } else {
          if (currentNode.right) {
            currentNode = currentNode.right
          } else {
            currentNode.right = node
            node.parent = currentNode
            break
          }
        } // > or <
      } // while
    } // if root or not
  } // add node

  findNode (val) {
    let currentNode = this.root
    while (currentNode) {
      if (currentNode.value > val) {
        currentNode = currentNode.left
      } else if (currentNode.value < val) {
        currentNode = currentNode.right
      } else {
        return currentNode
      }
    }
  }

  removeNode (val) {
    let node = this.findNode(val)
    if (node) {

      // two children
      if (node.hasTwoChildren()) {

        let iop = this.findIOP(node)
        node.value = iop.value
        // delete iop
        if (iop.parent) {
          if (iop.parent.left == iop) {
            iop.parent.left = iop.left
            if (iop.left) iop.left.parent = iop.parent
          } else {
            iop.parent.right = iop.left
            if (iop.left) iop.left.parent = iop.parent
          }
        } else {
          this.root = null
        }

      }

      // One Child
      else if (node.hasOneChild()) {
        let child = node.left ? node.left : node.right
        if (node.parent) {
          if (node.parent.left == node) {
            node.parent.left = child
            child.parent = node.parent
          } else {
            node.parent.right = child
            child.parent = node.parent
          }
        } else {
          this.root = child
        }
      } else {
        if (node.parent) {
          if (node.parent.left == node) {
            node.parent.left = null
          } else {
            node.parent.right = null
          }
        } else {
          this.root = null
        }
      }
    } else {
      console.log('No such a node with value' + val);
    }
  }

  inOrderTraverse (node) {
    if (!node) node = this.root
    if (node.left)  this.inOrderTraverse(node.left)
    console.log(node.value);
    if (node.right) this.inOrderTraverse(node.right)
  }

  preOrderTraverse (node) {
    if (!node) node = this.root
    console.log(node.value);
    if (node.left)  this.preOrderTraverse(node.left)
    if (node.right) this.preOrderTraverse(node.right)
  }

  postOrderTraverse (node) {
    if (!node) node = this.root
    if (node.left)  this.postOrderTraverse(node.left)
    if (node.right) this.postOrderTraverse(node.right)
    console.log(node.value);
  }

  findIOP (node) {
    if (!node) node = this.root
    let leftNode = node.left
    if (!leftNode) {
      return node
    }
    let currentNode = leftNode.right
    if (!currentNode) {
      return leftNode
    }
    while (currentNode.right) {
      currentNode = currentNode.right
    }
    return currentNode
  }
}

// as in the exercise 12-1.1
BinarySearchTree.isValidSequence = function (seq) {
  let isLeftArray = []

  for (var i = 1; i < seq.length; i++) {
    isLeftArray.push(seq[i] < seq[i-1])

    for (var j = 0; j < i; j++) {
      let isLeft = isLeftArray[j]
      if (
        (isLeft && seq[i] > seq[j])
        || (!isLeft && seq[i] < seq[j])
      ) {
        return false
      }
    }
  }

  return true
}

module.exports = BinarySearchTree

// let bst = new BinarySearchTree()
// bst.addNode(new BinaryTreeNode(14))
// bst.addNode(new BinaryTreeNode(16))
// bst.addNode(new BinaryTreeNode(10))
// bst.addNode(new BinaryTreeNode(5))
// bst.addNode(new BinaryTreeNode(12))
// bst.addNode(new BinaryTreeNode(15))
// bst.addNode(new BinaryTreeNode(17))
// bst.addNode(new BinaryTreeNode(13))
// bst.removeNode(14)
// // bst.inOrderTraverse()
// // bst.preOrderTraverse()
// bst.removeNode(14)
// bst.inOrderTraverse()
// console.log("---------");
// bst.removeNode(10)
// bst.inOrderTraverse()
// // console.log( bst.findInOrderPredecessor() )

// let s1 = [2, 252, 401, 398, 330, 344, 397, 363]
// let s2 = [924, 220, 911, 244, 898, 258, 362, 363]
// let s3 = [925, 202, 911, 240, 912, 245, 363]
// console.log(BinarySearchTree.isValidSequence(s1)); // true
// console.log(BinarySearchTree.isValidSequence(s2)); // true
// console.log(BinarySearchTree.isValidSequence(s3)); // false
