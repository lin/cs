let buildTree     = require('./src/buildTree').buildTree
let {parseTree}     = require('./src/Parser')

let render = function(expression, baseNode, options) {
    const node = renderToDomTree(expression, options).toNode();
    baseNode.appendChild(node);
};

const renderToString = function(expression, options) {
    const markup = renderToDomTree(expression, options).toMarkup();
    return markup;
};

const renderToDomTree = function(expression, options) {
    const tree = parseTree(expression, options);
    return buildTree(tree, expression, options);
};


let e = `\\frac{2}{3}`
let tree = parseTree(e) // DONE
console.log(tree);
// let newTree = buildTree(tree)

// newTree.toMarkup()
// console.log(newTree.toMarkup())

module.exports = {
    render,
    renderToString
};
