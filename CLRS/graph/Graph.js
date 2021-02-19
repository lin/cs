// BFS DFS
class Graph {
  constructor () {
    this.vertices = {}
    this.edgeList = []
    // this.adjacentList = []
    // this.adjacentMatrix = []
  }

  insertVertex (vertexKey) {
    this.vertices[vertexKey] = {
      v: vertexKey
    }
  }

  removeVertex (vertex) {
    // remove from vertices array
    // O(1)*
    if (this.vertices.hasOwnProperty(vertex)) {
      delete vertices[vertex]
    }

    // remove from edgeList
    // O(m)
    for (var i = 0; i < edgeList.length; i++) {
      if (edgeList[i].a == vertex || edgeList[i].b == vertex) {
        this.edgeList.splice(i, 1)
      }
    }

  }

  // O(1)
  insertEdge (vertex1, vertex2, value) {
    let edge = {
      a: vertex1, // from
      b: vertex2, // to
      v: value
    }
    this.edgeList.push(edge)
  }

  removeEdge (vertex1, vertex2) {
    // remove from edgeList
    // O(m) but using dictionary, this can be O(1)*
    for (var i = 0; i < this.edgeList.length; i++) {
      if (edgeList[i].a == vertex1 || edgeList[i].b == vertex2) {
        this.edgeList.splice(i, 1)
      }
    }
  }

  getEdge (v1, v2) {
    for (var i = 0; i < this.edgeList.length; i++) {
      let edge = this.edgeList[i]
      if (
        (edge.a == v1 && edge.b == v2) ||
        (edge.a == v2 && edge.b == v1)
      ) {
        return this.edgeList[i]
      }
    }
    return false
  }

  adjacentEdges (vertex) {
    let neighbors = []
    // remove from edgeList
    // O(m) but using dictionary, this
    for (var i = 0; i < this.edgeList.length; i++) {
      if (this.edgeList[i].a == vertex) {
        neighbors.push(this.edgeList[i].b)
      } else if (this.edgeList[i].b == vertex) {
        neighbors.push(this.edgeList[i].a)
      }
    }

    return neighbors
  }

  areAdjacent(v1, v2) {
    return v1.adjacentEdges().indexOf(v2) !== -1
  }

}

module.exports = Graph
