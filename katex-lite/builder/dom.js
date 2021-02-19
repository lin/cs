// const jsdom = require("jsdom");
// const { JSDOM } = jsdom;
// const { window } = new JSDOM(``);
// const { document } = (new JSDOM(``)).window;
const {contains, escape, hyphenate} = require('./utils')
const {path} = require("./svg");

const createClass = function(classes) {
    // filter will remove null undefined false
    return classes.filter(cls => cls).join(" ");
};

class Node {

  constructor (classes, options, style) {
      this.classes = classes || [];
      this.attributes = {};
      this.height = 0;
      this.depth = 0;
      this.maxFontSize = 0;
      this.style = style || {};
      if (options) {
          if (options.style.isTight()) {
              this.classes.push("mtight");
          }
          const color = options.getColor();
          if (color) {
              this.style.color = color;
          }
      }
  }

  // using the data from this node object
  // to a html dom node object.
  toNode (tagName) {
      const node = document.createElement(tagName);

      node.className = createClass(this.classes);

      for (const style in this.style) {
          if (this.style.hasOwnProperty(style)) {
              node.style[style] = this.style[style];
          }
      }

      // Apply attributes
      for (const attr in this.attributes) {
          if (this.attributes.hasOwnProperty(attr)) {
              node.setAttribute(attr, this.attributes[attr]);
          }
      }

      // Append the children, also as HTML nodes
      for (let i = 0; i < this.children.length; i++) {
          node.appendChild(this.children[i].toNode());
      }

      return node;
  }

  toMarkup (tagName) {

     let markup = `<${tagName}`;

     // Add the class
     if (this.classes.length) {
         markup += ` class="${escape(createClass(this.classes))}"`;
     }

     let styles = "";

     // Add the styles, after hyphenation
     for (const style in this.style) {

         if (this.style.hasOwnProperty(style)) {
             styles += `${hyphenate(style)}:${this.style[style]};`;
         }
     }

     if (styles) {
         markup += ` style="${escape(styles)}"`;
     }

     // Add the attributes
     for (const attr in this.attributes) {
         if (this.attributes.hasOwnProperty(attr)) {
             markup += ` ${attr}="${escape(this.attributes[attr])}"`;
         }
     }

     markup += ">";

     // Add the markup of the children, also as markup
     for (let i = 0; i < this.children.length; i++) {
         markup += this.children[i].toMarkup();
     }

     markup += `</${tagName}>`;

     return markup;
  }

}

class Span extends Node {

    constructor(classes, children, options, style) {
        super(classes, options, style);
        this.children = children || [];
    }

    setAttribute(attribute, value) {
        this.attributes[attribute] = value;
    }

    hasClass(className) {
        return contains(this.classes, className);
    }

    toNode() {
        return super.toNode("span");
    }

    toMarkup() {
        return super.toMarkup("span");
    }
}

class Anchor extends Node {

    constructor(
        href,
        classes,
        children,
        options,
    ) {
        super(classes, options);
        this.children = children || [];
        this.setAttribute('href', href);
    }

    setAttribute(attribute, value) {
        this.attributes[attribute] = value;
    }

    hasClass(className) {
        return contains(this.classes, className);
    }

    toNode() {
        return super.toNode("a");
    }

    toMarkup() {
        return super.toMarkup("a");
    }
}

/**
 * This node represents an image embed (<img>) element.
 */
class Img {

    constructor(
        src,
        alt,
        style,
    ) {
        this.alt = alt;
        this.src = src;
        this.classes = ["mord"];
        this.style = style;
    }

    hasClass(className) {
        return contains(this.classes, className);
    }

    toNode() {
        const node = document.createElement("img");
        node.src = this.src;
        node.alt = this.alt;
        node.className = "mord";

        for (const style in this.style) {
            if (this.style.hasOwnProperty(style)) {
                node.style[style] = this.style[style];
            }
        }

        return node;
    }

    toMarkup() {
        let markup = `<img  src='${this.src} 'alt='${this.alt}' `;

        // Add the styles, after hyphenation
        let styles = "";
        for (const style in this.style) {
            if (this.style.hasOwnProperty(style)) {
                styles += `${hyphenate(style)}:${this.style[style]};`;
            }
        }
        if (styles) {
            markup += ` style="${escape(styles)}"`;
        }

        markup += "'/>";
        return markup;
    }
}

class SymbolNode {

    constructor(
        text,
        height,
        depth,
        italic,
        skew,
        width,
        classes,
        style,
    ) {
        this.text = text;
        this.height = height || 0;
        this.depth = depth || 0;
        this.italic = italic || 0;
        this.skew = skew || 0;
        this.width = width || 0;
        this.classes = classes || [];
        this.style = style || {};
        this.maxFontSize = 0;
    }

    hasClass(className) {
        return contains(this.classes, className);
    }

    /**
     * Creates a text node or span from a symbol node. Note that a span is only
     * created if it is needed.
     */
    toNode() {
        const node = document.createTextNode(this.text);
        let span = null;

        if (this.italic > 0) {
            span = document.createElement("span");
            span.style.marginRight = this.italic + "em";
        }

        if (this.classes.length > 0) {
            span = span || document.createElement("span");
            span.className = createClass(this.classes);
        }

        for (const style in this.style) {
            if (this.style.hasOwnProperty(style)) {
                span = span || document.createElement("span");
                span.style[style] = this.style[style];
            }
        }

        if (span) {
            span.appendChild(node);
            return span;
        } else {
            return node;
        }
    }

    toMarkup() {
        let needsSpan = false;

        let markup = "<span";

        if (this.classes.length) {
            needsSpan = true;
            markup += " class=\"";
            markup += escape(createClass(this.classes));
            markup += "\"";
        }

        let styles = "";

        if (this.italic > 0) {
            styles += "margin-right:" + this.italic + "em;";
        }
        for (const style in this.style) {
            if (this.style.hasOwnProperty(style)) {
                styles += hyphenate(style) + ":" + this.style[style] + ";";
            }
        }

        if (styles) {
            needsSpan = true;
            markup += " style=\"" + escape(styles) + "\"";
        }

        const escaped = escape(this.text);
        if (needsSpan) {
            markup += ">";
            markup += escaped;
            markup += "</span>";
            return markup;
        } else {
            return escaped;
        }
    }
}

/**
 * SVG nodes are used to render stretchy wide elements.
 */
class SvgNode {

    constructor (children, attributes) {
        this.children = children || [];
        this.attributes = attributes || {};
    }

    toNode() {
        const svgNS = "http://www.w3.org/2000/svg";
        const node = document.createElementNS(svgNS, "svg");

        // Apply attributes
        for (const attr in this.attributes) {
            if (Object.prototype.hasOwnProperty.call(this.attributes, attr)) {
                node.setAttribute(attr, this.attributes[attr]);
            }
        }

        for (let i = 0; i < this.children.length; i++) {
            node.appendChild(this.children[i].toNode());
        }
        return node;
    }

    toMarkup() {
        let markup = "<svg";

        // Apply attributes
        for (const attr in this.attributes) {
            if (Object.prototype.hasOwnProperty.call(this.attributes, attr)) {
                markup += ` ${attr}='${this.attributes[attr]}'`;
            }
        }

        markup += ">";

        for (let i = 0; i < this.children.length; i++) {
            markup += this.children[i].toMarkup();
        }

        markup += "</svg>";

        return markup;

    }
}

class PathNode {

    constructor(pathName, alternate) {
        this.pathName = pathName;
        this.alternate = alternate;  // Used only for \sqrt
    }

    toNode() {
        const svgNS = "http://www.w3.org/2000/svg";
        const node = document.createElementNS(svgNS, "path");

        if (this.alternate) {
            node.setAttribute("d", this.alternate);
        } else {
            node.setAttribute("d", path[this.pathName]);
        }

        return node;
    }

    toMarkup() {
        if (this.alternate) {
            return `<path d='${this.alternate}'/>`;
        } else {
            return `<path d='${path[this.pathName]}'/>`;
        }
    }
}

class LineNode {

    constructor(attributes) {
        this.attributes = attributes || {};
    }

    toNode() {
        const svgNS = "http://www.w3.org/2000/svg";
        const node = document.createElementNS(svgNS, "line");

        // Apply attributes
        for (const attr in this.attributes) {
            if (Object.prototype.hasOwnProperty.call(this.attributes, attr)) {
                node.setAttribute(attr, this.attributes[attr]);
            }
        }

        return node;
    }

    toMarkup() {
        let markup = "<line";

        for (const attr in this.attributes) {
            if (Object.prototype.hasOwnProperty.call(this.attributes, attr)) {
                markup += ` ${attr}='${this.attributes[attr]}'`;
            }
        }

        markup += "/>";

        return markup;
    }
}

class DocumentFragment {

    constructor (children) {
        this.children = children;
        this.classes = [];
        this.height = 0;
        this.depth = 0;
        this.maxFontSize = 0;
        this.style = {};
    }

    hasClass(className) {
      return this.classes.indexOf(className) !== -1
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

module.exports = {createClass, Span, Anchor, Img, SymbolNode, SvgNode, PathNode, DocumentFragment}
