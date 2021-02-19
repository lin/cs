const {makeGlue} = require('../common/elems')
const {spacings, tightSpacings} = require('./spacing')
// Binary atoms (first class `mbin`) change into ordinary atoms (`mord`)
// depending on their surroundings. See TeXbook pg. 442-446, Rules 5 and 6,
// and the text before Rule 19.
const binLeftCanceller = ["leftmost", "mbin", "mopen", "mrel", "mop", "mpunct"];
const binRightCanceller = ["rightmost", "mrel", "mclose", "mpunct"];

const styleMap = {
    "display": Style.DISPLAY,
    "text": Style.TEXT,
    "script": Style.SCRIPT,
    "scriptscript": Style.SCRIPTSCRIPT,
};

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

const DomEnum = {
    mord: "mord",
    mop: "mop",
    mbin: "mbin",
    mrel: "mrel",
    mopen: "mopen",
    mclose: "mclose",
    mpunct: "mpunct",
    minner: "minner",
};

// Check if given node is a partial group, i.e., does not affect spacing around.
const checkPartialGroup = function (node) {
    if (node instanceof DocumentFragment || node instanceof Anchor) {
        return node;
    }
    return null;
};

// Return the outermost node of a domTree.
const getOutermostNode = function (node, side) {
    const partialGroup = checkPartialGroup(node);
    if (partialGroup) {
        const children = partialGroup.children;
        if (children.length) {
            if (side === "right") {
                return getOutermostNode(children[children.length - 1], "right");
            } else if (side === "left") {
                return getOutermostNode(children[0], "left");
            }
        }
    }
    return node;
};

// Return math atom class (mclass) of a domTree.
// If `side` is given, it will get the type of the outermost node at given side.
const getTypeOfDomTree = function (node, side) {
    if (!node) {
        return null;
    }
    if (side) {
        node = getOutermostNode(node, side);
    }
    // This makes a lot of assumptions as to where the type of atom
    // appears.  We should do a better job of enforcing this.
    return DomEnum[node.classes[0]] || null;
};

// Depth-first traverse non-space `nodes`, calling `callback` with the current and
// previous node as arguments, optionally returning a node to insert after the
// previous node. `prev` is an object with the previous node and `insertAfter`
// function to insert after it. `next` is a node that will be added to the right.
// Used for bin cancellation and inserting spacings.
const traverseNonSpaceNodes = function (nodes, callback, prev, next) {
    if (next) { // temporarily append the right node, if exists
        nodes.push(next);
    }
    let i = 0;
    for (; i < nodes.length; i++) {
        const node = nodes[i];
        const partialGroup = checkPartialGroup(node);
        if (partialGroup) { // Recursive DFS
            traverseNonSpaceNodes(partialGroup.children, callback, prev);
            continue;
        }

        // Ignore explicit spaces (e.g., \;, \,) when determining what implicit
        // spacing should go between atoms of different classes
        if (node.classes[0] === "mspace") {
            continue;
        }

        const result = callback(node, prev.node);
        if (result) {
            if (prev.insertAfter) {
                prev.insertAfter(result);
            } else { // insert at front
                nodes.unshift(result);
                i++;
            }
        }

        prev.node = node;
        prev.insertAfter = (index => n => {
            nodes.splice(index + 1, 0, n);
            i++;
        })(i);
    }
    if (next) {
        nodes.pop();
    }
};

/**
 * Take a list of nodes, build them in order, and return a list of the built
 * nodes. documentFragments are flattened into their contents, so the
 * returned list contains no fragments. `isRealGroup` is true if `expression`
 * is a real group (no atoms will be added on either side), as opposed to
 * a partial group (e.g. one created by \color). `surrounding` is an array
 * consisting type of nodes that will be added to the left and right.
 */
const buildExpression = function(
    expression, // tree
    options,
    isRealGroup,
    surrounding = [null, null]
) {
    // Parse expressions into `groups`.
    const groups = [];
    for (let i = 0; i < expression.length; i++) {
        const output = buildGroup(expression[i], options);
        if (output instanceof DocumentFragment) {
            const children = output.children; // flatten the frag
            groups.push(...children);
        } else {
            groups.push(output);
        }
    }

    // If `expression` is a partial group, let the parent handle spacings
    // to avoid processing groups multiple times.
    if (!isRealGroup) {
        return groups;
    }

    let glueOptions = options;
    if (expression.length === 1) {
        const node = checkNodeType(expression[0], "sizing") ||
            checkNodeType(expression[0], "styling");
        if (!node) {
            // No match.
        } else if (node.type === "sizing") {
            glueOptions = options.havingSize(node.size);
        } else if (node.type === "styling") {
            glueOptions = options.havingStyle(styleMap[node.style]);
        }
    }

    // Dummy spans for determining spacings between surrounding atoms.
    // If `expression` has no atoms on the left or right, class "leftmost"
    // or "rightmost", respectively, is used to indicate it.
    const dummyPrev = makeSpan([surrounding[0] || "leftmost"], [], options);
    const dummyNext = makeSpan([surrounding[1] || "rightmost"], [], options);

    // TODO: These code assumes that a node's math class is the first element
    // of its `classes` array. A later cleanup should ensure this, for
    // instance by changing the signature of `makeSpan`.

    // Before determining what spaces to insert, perform bin cancellation.
    // Binary operators change to ordinary symbols in some contexts.
    traverseNonSpaceNodes(groups, (node, prev) => {
        const prevType = prev.classes[0];
        const type = node.classes[0];
        if (prevType === "mbin" && contains(binRightCanceller, type)) {
            prev.classes[0] = "mord";
        } else if (type === "mbin" && contains(binLeftCanceller, prevType)) {
            node.classes[0] = "mord";
        }
    }, {node: dummyPrev}, dummyNext);

    traverseNonSpaceNodes(groups, (node, prev) => {
        const prevType = getTypeOfDomTree(prev);
        const type = getTypeOfDomTree(node);

        // 'mtight' indicates that the node is script or scriptscript style.
        const space = prevType && type ? (node.hasClass("mtight")
            ? tightSpacings[prevType][type]
            : spacings[prevType][type]) : null;
        if (space) { // Insert glue (spacing) after the `prev`.
            return makeGlue(space, glueOptions);
        }
    }, {node: dummyPrev}, dummyNext);

    return groups;
};
