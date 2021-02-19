const Style = require('./Style');
const {contains} = require("../utils");
const {spacings, tightSpacings} = require("./spacing");
const {Anchor, DocumentFragment} = require("../dom");
const buildCommon = require('../common')
const makeSpan = buildCommon.makeSpan

function buildHTML (tree, options) {

    const expression = buildExpression(tree, options, true);

    const children = [];

    // Create one base node for each chunk between potential line breaks.
    // The TeXBook [p.173] says "A formula will be broken only after a
    // relation symbol like $=$ or $<$ or $\rightarrow$, or after a binary
    // operation symbol like $+$ or $-$ or $\times$, where the relation or
    // binary operation is on the ``outer level'' of the formula (i.e., not
    // enclosed in {...} and not part of an \over construction)."

    let parts = [];
    for (let i = 0; i < expression.length; i++) {
        parts.push(expression[i]);
        if (expression[i].hasClass("mbin") ||
            expression[i].hasClass("mrel") ||
            expression[i].hasClass("allowbreak")) {
            // Put any post-operator glue on same line as operator.
            // Watch for \nobreak along the way, and stop at \newline.
            let nobreak = false;
            while (i < expression.length - 1 &&
                   expression[i + 1].hasClass("mspace") &&
                   !expression[i + 1].hasClass("newline")) {
                i++;
                parts.push(expression[i]);
                if (expression[i].hasClass("nobreak")) {
                    nobreak = true;
                }
            }
            // Don't allow break if \nobreak among the post-operator glue.
            if (!nobreak) {
                children.push(buildHTMLUnbreakable(parts, options));
                parts = [];
            }
        } else if (expression[i].hasClass("newline")) {
            // Write the line except the newline
            parts.pop();
            if (parts.length > 0) {
                children.push(buildHTMLUnbreakable(parts, options));
                parts = [];
            }
            // Put the newline at the top level
            children.push(expression[i]);
        }
    }

    if (parts.length > 0) {
        children.push(buildHTMLUnbreakable(parts, options));
    }

    // Now, if there was a tag, build it too and append it as a final child.
    let tagChild;
    if (tag) {
        tagChild = buildHTMLUnbreakable(
            buildExpression(tag, options, true)
        );
        tagChild.classes = ["tag"];
        children.push(tagChild);
    }

    const htmlNode = makeSpan(["katex-html"], children);
    htmlNode.setAttribute("aria-hidden", "true");

    // Adjust the strut of the tag to be the maximum height of all children
    // (the height of the enclosing htmlNode) for proper vertical alignment.
    if (tagChild) {
        const strut = tagChild.children[0];
        strut.style.height = (htmlNode.height + htmlNode.depth) + "em";
        strut.style.verticalAlign = (-htmlNode.depth) + "em";
    }

    return htmlNode;
}

/**
 * Combine an array of HTML DOM nodes (e.g., the output of `buildExpression`)
 * into an unbreakable HTML node of class .base, with proper struts to
 * guarantee correct vertical extent.  `buildHTML` calls this repeatedly to
 * make up the entire expression as a sequence of unbreakable units.
 */
function buildHTMLUnbreakable (children, options) {
    // Compute height and depth of this chunk.
    const body = makeSpan(["base"], children, options);

    // Add strut, which ensures that the top of the HTML element falls at
    // the height of the expression, and the bottom of the HTML element
    // falls at the depth of the expression.

    const strut = makeSpan(["strut"]);
    strut.style.height = (body.height + body.depth) + "em";
    strut.style.verticalAlign = -body.depth + "em";
    body.children.unshift(strut);

    return body;
}

module.exports = {
  buildHTML,
  buildHTMLUnbreakable
}

Object.assign(
  module.exports
)
