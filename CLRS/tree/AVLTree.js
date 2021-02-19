const BinaryTreeNode   = require('./BinaryTreeNode')
const BinarySearchTree = require('./BinarySearchTree')

class AVLTree extends BinarySearchTree {

  addNode (node) {
    super.addNode(node)
    let currentNode = node
    while (currentNode) {
      this.ensureBalance(currentNode);
      currentNode = currentNode.parent;
    }
  }

  removeNode (val) {
    let node = this.findNode(val)
    let numberOfChildren = node.getNumberOfChildren()
    let iop = this.findIOP(node)

    super.removeNode(val)

    let currentNode = node
    if (numberOfChildren == 2) currentNode = iop

    while (currentNode) {
      this.ensureBalance(currentNode);
      currentNode = currentNode.parent;
    }

  }

  getBalanceFactor (node) {
    let leftHeight  = -1
    let rightHeight = -1
    if (node.left)  leftHeight  = node.left.getHeight()
    if (node.right) rightHeight = node.right.getHeight()
    return rightHeight - leftHeight
  }

  ensureBalance (node) {
    let balance = this.getBalanceFactor(node)
    if (balance == -2) {
      let leftBalance = this.getBalanceFactor(node.left)
      if (leftBalance == -1) {
        this.rightRotation(node) // case: /
      } else if (leftBalance == 1) {
        this.leftRightRotation(node) // case: <
      }
    } else if (balance == 2) {
      let rightBalance = this.getBalanceFactor(node.right)
      if (rightBalance == 1) {
        this.leftRotation(node) // case: \
      } else if (rightBalance == -1) {
        this.rightLeftRotation(node) // case: >
      }
    }
  }

  rightRotation (node) {
    let leftChild = node.left
    node.left = leftChild.right
    leftChild.right = node
    leftChild.parent = node.parent
    if (node.parent) node.parent.right = leftChild
    node.parent = leftChild
    if (node == this.root) {
      this.root = leftChild
    }
  }

  leftRotation (node) {
    let rightChild = node.right
    node.right = rightChild.left
    rightChild.left = node
    rightChild.parent = node.parent
    if (node.parent) node.parent.right = rightChild
    node.parent = rightChild
    if (node == this.root) {
      this.root = rightChild
    }
  }

  rightLeftRotation (node) {
    let rightChild = node.right
    let rightChildLeft = node.right.left

    node.right = rightChildLeft
    rightChildLeft.parent = node
    rightChild.left = rightChildLeft.right
    rightChild.parent = rightChildLeft
    rightChildLeft.right = rightChild

    this.leftRotation(node)
  }

  leftRightRotation (node) {
    let leftChild = node.left
    let leftChildRight = node.left.right

    node.left = leftChildRight
    leftChildRight.parent = node
    leftChild.right = leftChildRight.left
    leftChild.parent = leftChildRight
    leftChildRight.left = leftChild

    this.rightRotation(node)
  }

}

// let bst = new AVLTree()
// bst.addNode(new BinaryTreeNode(4))
// bst.addNode(new BinaryTreeNode(2))
// bst.addNode(new BinaryTreeNode(1))
// bst.addNode(new BinaryTreeNode(3))
// // bst.removeNode(2)
// bst.inOrderTraverse()
