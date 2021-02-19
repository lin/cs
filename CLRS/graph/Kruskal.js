const DisjointSet = require('../DisjointSet/DisjointSet')
const Graph = require('./Graph')

function Kruskal (graph) {
  let resultEdges = []
  let ds = new DisjointSet()
  let charCodeOfLowerCaseA = 'a'.charCodeAt()

  const verticeskeys = Object.keys(graph.vertices)

  for (const vertexKey of verticeskeys) {
    let vertexVal = graph.vertices[vertexKey].v
    ds.makeSet(vertexVal.charCodeAt() - charCodeOfLowerCaseA)
  }

  graph.edgeList.sort((a, b) => a.v > b.v ? 1 : -1)
  for (var i = 0; i < graph.edgeList.length; i++) {
    let edge = graph.edgeList[i]
    let aIndex = edge.a.charCodeAt() - charCodeOfLowerCaseA
    let bIndex = edge.b.charCodeAt() - charCodeOfLowerCaseA

    if (ds.findSet(aIndex) !== ds.findSet(bIndex)) {
      resultEdges.push(edge)
      ds.union(aIndex, bIndex)
    }
  }

  return resultEdges
}

module.exports = Kruskal
