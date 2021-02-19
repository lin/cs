function checkNodeType(
    node,
    type,
) {
    if (node && node.type === type) {
        // The definition of ParseNode<TYPE> doesn't communicate to flow that
        // `type: TYPE` (as that's not explicitly mentioned anywhere), though that
        // happens to be true for all our value types.
        // $FlowFixMe
        return node;
    }
    return null;
}

function assertNodeType(
    node,
    type
) {
    const typedNode = checkNodeType(node, type);
    return typedNode;
}

module.exports = {checkNodeType, assertNodeType}
