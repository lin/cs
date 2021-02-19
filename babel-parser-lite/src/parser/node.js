const Tokenizer = require('../tokenizer')

// node = this.startNode();
// this.next();
// return this.finishNode(node, "Node Type Name");

class Node {
  constructor(parser, pos, loc) {
    this.type = "";
    this.start = pos;
    this.end = 0;
    this.loc = new SourceLocation(loc);
  }

  __clone() {
    // $FlowIgnore
    const newNode = new Node();
    const keys = Object.keys(this);
    for (let i = 0, length = keys.length; i < length; i++) {
      const key = keys[i];
      // Do not clone comments that are already attached to the node
      if (
        key !== "leadingComments" &&
        key !== "trailingComments" &&
        key !== "innerComments"
      ) {
        // $FlowIgnore
        newNode[key] = this[key];
      }
    }

    return newNode
  }
}

class NodeUtils extends Tokenizer {
  startNode() {
    return new Node(this, this.state.start, this.state.startLoc);
  }

  startNodeAt(pos, loc) {
    return new Node(this, pos, loc);
  }

  startNodeAtNode(type) { // type is a node
    return this.startNodeAt(type.start, type.loc.start);
  }

  finishNode(node, type) {
    return this.finishNodeAt(node, type,
      this.state.lastTokEnd, this.state.lastTokEndLoc);
  }

  // Finish node at given position

  finishNodeAt(node, type, pos, loc) {
    node.type = type;
    node.end = pos;
    node.loc.end = loc;
    // this.processComment(node);
    return node;
  }

  resetStartLocation(node, start, startLoc) {
    node.start = start;
    node.loc.start = startLoc;
  }

  resetEndLocation( node, end, endLoc) {
    node.end = end;
    node.loc.end = endLoc;
    if (this.options.ranges) node.range[1] = end;
  }

  resetStartLocationFromNode(node, locationNode) {
    this.resetStartLocation(node, locationNode.start, locationNode.loc.start);
  }
}

module.exports = {NodeUtils}
