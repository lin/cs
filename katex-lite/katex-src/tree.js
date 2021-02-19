// @flow

const {contains} = require("./utils");


/**
 * This node represents a document fragment, which contains elements, but when
 * placed into the DOM doesn't have any representation itself. It only contains
 * children and doesn't have any DOM node properties.
 */
class DocumentFragment {

    constructor(children) {
        this.children = children;
        this.classes = [];
        this.height = 0;
        this.depth = 0;
        this.maxFontSize = 0;
        this.style = {};
    }

    hasClass(className) {
        return contains(this.classes, className);
    }

    /** Convert the fragment into a node. */
    toNode() {
        const frag = document.createDocumentFragment();

        for (let i = 0; i < this.children.length; i++) {
            frag.appendChild(this.children[i].toNode());
        }

        return frag;
    }

    toMarkup() {
        let markup = "";

        // Simply concatenate the markup for the children together.
        for (let i = 0; i < this.children.length; i++) {
            markup += this.children[i].toMarkup(); // provided by children themselves
        }

        return markup;
    }

    toText() {
        const toText = (child) => child.toText();
        return this.children.map(toText).join("");
    }
}

module.exports = {DocumentFragment}
