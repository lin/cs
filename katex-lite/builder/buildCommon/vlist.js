// Computes the updated `children` list and the overall depth.
//
// This helper function for makeVList makes it easier to enforce type safety by
// allowing early exits (returns) in the logic.
const getVListChildrenAndDepth = function(params) {

    if (params.positionType === "individualShift") {
        const oldChildren = params.children;
        const children = [oldChildren[0]];

        // Add in kerns to the list of params.children to get each element to be
        // shifted to the correct specified shift
        const depth = -oldChildren[0].shift - oldChildren[0].elem.depth;
        let currPos = depth;
        for (let i = 1; i < oldChildren.length; i++) {
            const diff = -oldChildren[i].shift - currPos -
                oldChildren[i].elem.depth;
            const size = diff -
                (oldChildren[i - 1].elem.height +
                 oldChildren[i - 1].elem.depth);

            currPos = currPos + diff;

            children.push({type: "kern", size});
            children.push(oldChildren[i]);
        }

        return {children, depth};
    }

    let depth;
    if (params.positionType === "top") {
        // We always start at the bottom, so calculate the bottom by adding up
        // all the sizes
        let bottom = params.positionData;
        for (let i = 0; i < params.children.length; i++) {
            const child = params.children[i];
            bottom -= child.type === "kern"
                ? child.size
                : child.elem.height + child.elem.depth;
        }
        depth = bottom;
    } else if (params.positionType === "bottom") {
        depth = -params.positionData;
    } else {
        const firstChild = params.children[0];
        if (firstChild.type !== "elem") {
            throw new Error('First child must have type "elem".');
        }
        if (params.positionType === "shift") {
            depth = -firstChild.elem.depth - params.positionData;
        } else if (params.positionType === "firstBaseline") {
            depth = -firstChild.elem.depth;
        } else {
            throw new Error(`Invalid positionType ${params.positionType}.`);
        }
    }
    return {children: params.children, depth};
};

/**
 * Makes a vertical list by stacking elements and kerns on top of each other.
 * Allows for many different ways of specifying the positioning method.
 *
 * See VListParam documentation above.
 */
const makeVList = function (params, options) {

    const {children, depth} = getVListChildrenAndDepth(params);

    let pstrutSize = 0;

    // children is calculated by above function
    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (child.type === "elem") { // not kern
            const elem = child.elem;
            pstrutSize = Math.max(pstrutSize, elem.maxFontSize, elem.height);
        }
    }

    pstrutSize += 2;

    const pstrut = makeSpan(["pstrut"], []);
    pstrut.style.height = pstrutSize + "em";

    // Create a new list of actual children at the correct offsets
    const realChildren = [];
    let minPos = depth;
    let maxPos = depth;
    let currPos = depth;

    for (let i = 0; i < children.length; i++) {
        const child = children[i];

        if (child.type === "kern") {
            currPos += child.size;
        } else {
            const elem = child.elem;
            const classes = child.wrapperClasses || [];
            const style = child.wrapperStyle || {};

            const childWrap = makeSpan(classes, [pstrut, elem], undefined, style);
            childWrap.style.top = (-pstrutSize - currPos - elem.depth) + "em";
            if (child.marginLeft) {
                childWrap.style.marginLeft = child.marginLeft;
            }
            if (child.marginRight) {
                childWrap.style.marginRight = child.marginRight;
            }

            realChildren.push(childWrap);
            currPos += elem.height + elem.depth;
        }
        minPos = Math.min(minPos, currPos);
        maxPos = Math.max(maxPos, currPos);
    }

    // The vlist contents go in a table-cell with `vertical-align:bottom`.
    // This cell's bottom edge will determine the containing table's baseline
    // without overly expanding the containing line-box.
    const vlist = makeSpan(["vlist"], realChildren);
    vlist.style.height = maxPos + "em";

    // A second row is used if necessary to represent the vlist's depth.
    let rows;
    if (minPos < 0) {
        // We will define depth in an empty span with display: table-cell.
        // It should render with the height that we define. But Chrome, in
        // contenteditable mode only, treats that span as if it contains some
        // text content. And that min-height over-rides our desired height.
        // So we put another empty span inside the depth strut span.
        const emptySpan = makeSpan([], []);
        const depthStrut = makeSpan(["vlist"], [emptySpan]);
        depthStrut.style.height = -minPos + "em";

        // Safari wants the first row to have inline content; otherwise it
        // puts the bottom of the *second* row on the baseline.
        const topStrut = makeSpan(["vlist-s"], [new SymbolNode("\u200b")]);

        rows = [makeSpan(["vlist-r"], [vlist, topStrut]),
            makeSpan(["vlist-r"], [depthStrut])];
    } else {
        rows = [makeSpan(["vlist-r"], [vlist])];
    }

    const vtable = makeSpan(["vlist-t"], rows);
    if (rows.length === 2) {
        vtable.classes.push("vlist-t2");
    }
    vtable.height = maxPos;
    vtable.depth = -minPos;
    return vtable;
};

module.exports = {makeVList}
