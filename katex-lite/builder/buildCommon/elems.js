const {Anchor, DocumentFragment, SvgNode, PathNode, Span} = require("./dom")
const sizeElementFromChildren = require('./size')
const {calculateSize} = require("../units");

const makeSpan = function (classes, children, options, style) {
    const span = new Span(classes, children, options, style);

    // it will caculate size information based on the children
    // find the largest from all children
    // height, depth, maxFontSize
    sizeElementFromChildren(span);

    return span;
};

const makeSvgSpan =
  (classes, children, options, style) => new Span(classes, children, options, style);

const makeLineSpan = function (className, options, thickness) {
    const line = makeSpan([className], [], options);
    // line is a span
    // but you have to change its value specific for lines
    // which is the borderBottomWidth
    // its maxFontSize will be reset as 1.0
    line.height = Math.max(
        thickness || options.fontMetrics().defaultRuleThickness,
        options.minRuleThickness,
    );
    line.style.borderBottomWidth = line.height + "em";
    line.maxFontSize = 1.0;

    return line;
};

const makeAnchor = function (href, classes, children, options) {
    const anchor = new Anchor(href, classes, children, options);

    sizeElementFromChildren(anchor);

    return anchor;
};

const makeFragment = function (children) {
    const fragment = new DocumentFragment(children);

    sizeElementFromChildren(fragment);

    return fragment;
};

const wrapFragment = function (group, options) {
    if (group instanceof DocumentFragment) {
        return makeSpan([], [group], options);
    }
    return group;
};

const svgData = {
    vec:         ["vec", 0.471, 0.714],         // values from the font glyph
    oiintSize1:  ["oiintSize1", 0.957, 0.499],  // oval to overlay the integrand
    oiintSize2:  ["oiintSize2", 1.472, 0.659],
    oiiintSize1: ["oiiintSize1", 1.304, 0.499],
    oiiintSize2: ["oiiintSize2", 1.98, 0.659],
};

const staticSvg = function (value, options) {
    // Create a span with inline SVG for the element.
    const [pathName, width, height] = svgData[value];
    const path = new PathNode(pathName);
    const svgNode = new SvgNode([path], {
        "width": width + "em",
        "height": height + "em",
        // Override CSS rule `.katex svg { width: 100% }`
        "style": "width:" + width + "em",
        "viewBox": "0 0 " + 1000 * width + " " + 1000 * height,
        "preserveAspectRatio": "xMinYMin",
    });
    const span = makeSvgSpan(["overlay"], [svgNode], options);
    span.height = height;
    span.style.height = height + "em";
    span.style.width = width + "em";
    return span;
};

const makeGlue = (measurement, options) => {
    // Make an empty span for the space
    const rule = makeSpan(["mspace"], [], options);
    const size = calculateSize(measurement, options);
    rule.style.marginRight = `${size}em`;
    return rule;
};

const makeNullDelimiter = function(
    options,
    classes,
) {
    const moreClasses = ["nulldelimiter"].concat(options.baseSizingClasses());
    return makeSpan(classes.concat(moreClasses));
};

module.exports = {
  makeSpan,
  makeSvgSpan,
  makeLineSpan,
  makeAnchor,
  makeFragment,
  wrapFragment,
  svgData,
  staticSvg,
  makeGlue,
  makeNullDelimiter
}
