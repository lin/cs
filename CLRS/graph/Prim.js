const Graph = require('./Graph')
const Queue = require('../linear/Queue')

function Prim (graph, start) {
  let q = new Queue()
  // mark vertices
  const verticeskeys = Object.keys(graph.vertices)
  for (const vertexKey of verticeskeys) {
    let vertex = graph.vertices[vertexKey]
    vertex.visited = false
    vertex.d = Infinity
    vertex.parent = null
    q.enqueue(vertex)
  }
  // mark the starting node
  start.d = 0
  let visited = []

  for (const vertexKey of verticeskeys) {
    let minV = getMinimumDVertex(graph)
    visited.push(minV) // save the path
    minV.visited = true

    let neighbors = graph.adjacentEdges(minV.v)
    for (var i = 0; i < neighbors.length; i++) {
      let neighbor = graph.vertices[neighbors[i]]
      let edge = graph.getEdge(neighbor.v, minV.v)

      if (!neighbor.visited && neighbor.d > edge.v) {
        neighbor.d = edge.v
        neighbor.parent = minV
      }
    }
  }

  function getMinimumDVertex(graph) {
    let vertices = graph.vertices
    let minimumDVertex
    let minimum = Infinity

    const verticeskeys = Object.keys(graph.vertices)
    for (const vertexKey of verticeskeys) {
      let v = graph.vertices[vertexKey]
      if (v.d < minimum && v.visited == false) {
        minimum = v.d
        minimumDVertex = v
      }
    }

    return minimumDVertex
  }

  return visited
}

module.exports = Prim
