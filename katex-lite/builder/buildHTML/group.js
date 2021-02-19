const groupBuilders = require("./function")._htmlGroupBuilders;

const buildGroup = function (group, options, baseOptions) {
    if (!group) {
        return makeSpan();
    }
    if (groupBuilders[group.type]) {
        // Call the groupBuilders function
        // $FlowFixMe
        let groupNode = groupBuilders[group.type](group, options);

        // If the size changed between the parent and the current group, account
        // for that size difference.
        if (baseOptions && options.size !== baseOptions.size) {
            groupNode = makeSpan(options.sizingClasses(baseOptions),
                [groupNode], options);

            const multiplier =
                options.sizeMultiplier / baseOptions.sizeMultiplier;

            groupNode.height *= multiplier;
            groupNode.depth *= multiplier;
        }

        return groupNode;
    } else {
        throw new SyntaxError(
            "Got group of unknown type: '" + group.type + "'");
    }
};
