const _functions = {};
const _htmlGroupBuilders = {};

function defineFunction({type, nodeType, names, props,
    handler, htmlBuilder, mathmlBuilder}) {

    // Set default values of functions
    const data = {
        type,
        numArgs: props.numArgs,
        argTypes: props.argTypes,
        greediness: (props.greediness === undefined) ? 1 : props.greediness,
        allowedInText: !!props.allowedInText,
        allowedInMath: (props.allowedInMath === undefined)
            ? true
            : props.allowedInMath,
        numOptionalArgs: props.numOptionalArgs || 0,
        infix: !!props.infix,
        consumeMode: props.consumeMode,
        handler: handler,
    };

    for (let i = 0; i < names.length; ++i) {// [create, new, generate]
        _functions[names[i]] = data;
    }

    if (type) {// boolean
        if (htmlBuilder) {
            _htmlGroupBuilders[type] = htmlBuilder;
        }
        if (mathmlBuilder) {
            _mathmlGroupBuilders[type] = mathmlBuilder;
        }
    }

}

/**
 * Use this to register only the HTML and MathML builders for a function (e.g.
 * if the function's ParseNode is generated in Parser.js rather than via a
 * stand-alone handler provided to `defineFunction`).
 */
function defineFunctionBuilders({type, htmlBuilder, mathmlBuilder}) {
    defineFunction({type, names: [], props: {numArgs: 0},
        handler() { throw new Error('Should never be called.'); },htmlBuilder});
}

// Since the corresponding buildHTML/buildMathML function expects a
// list of elements, we normalize for different kinds of arguments
const ordargument = function (arg) {
    const node = checkNodeType(arg, "ordgroup");
    return node ? node.body : [arg];
};

module.exports = {_functions, _htmlGroupBuilders, defineFunction, defineFunctionBuilders, ordargument}
