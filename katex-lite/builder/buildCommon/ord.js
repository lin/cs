const {contains} = require('../utils')
const {lookupSymbol} = require('./symbol')

const fontMap = {
    // styles
    "mathbf": {
        variant: "bold",
        fontName: "Main-Bold",
    },
    "mathrm": {
        variant: "normal",
        fontName: "Main-Regular",
    },
    "textit": {
        variant: "italic",
        fontName: "Main-Italic",
    },
    "mathit": {
        variant: "italic",
        fontName: "Main-Italic",
    },

    // Default math font, "mathnormal" and "boldsymbol" are missing because they
    // require the use of several fonts: Main-Italic and Math-Italic for default
    // math font, Main-Italic, Math-Italic, Caligraphic for "mathnormal", and
    // Math-BoldItalic and Main-Bold for "boldsymbol".  This is handled by a
    // special case in makeOrd which ends up calling mathdefault, mathnormal,
    // and boldsymbol.

    // families
    "mathbb": {
        variant: "double-struck",
        fontName: "AMS-Regular",
    },
    "mathcal": {
        variant: "script",
        fontName: "Caligraphic-Regular",
    },
    "mathfrak": {
        variant: "fraktur",
        fontName: "Fraktur-Regular",
    },
    "mathscr": {
        variant: "script",
        fontName: "Script-Regular",
    },
    "mathsf": {
        variant: "sans-serif",
        fontName: "SansSerif-Regular",
    },
    "mathtt": {
        variant: "monospace",
        fontName: "Typewriter-Regular",
    },
};


// The following have to be loaded from Main-Italic font, using class mathit
const mathitLetters = [
    "\\imath", "ı",       // dotless i
    "\\jmath", "ȷ",       // dotless j
    "\\pounds", "\\mathsterling", "\\textsterling", "£",   // pounds symbol
];

/**
 * Determines which of the font names (Main-Italic, Math-Italic, and Caligraphic)
 * and corresponding style tags (mathit, mathdefault, or mathcal) to use for font
 * "mathnormal", depending on the symbol.  Use this function instead of fontMap for
 * font "mathnormal".
 */
const mathnormal = function(
    value,
    mode,
    options,
    classes,
) {
    if (contains(mathitLetters, value)) {
        return {
            fontName: "Main-Italic",
            fontClass: "mathit",
        };
    } else if (/[0-9]/.test(value.charAt(0))) {
        return {
            fontName: "Caligraphic-Regular",
            fontClass: "mathcal",
        };
    } else {
        return {
            fontName: "Math-Italic",
            fontClass: "mathdefault",
        };
    }
};

const boldsymbol = function (value, mode, options, classes) {
    if (lookupSymbol(value, "Math-BoldItalic", mode).metrics) {
        return {
            fontName: "Math-BoldItalic",
            fontClass: "boldsymbol",
        };
    } else {
        // Some glyphs do not exist in Math-BoldItalic so we need to use
        // Main-Bold instead.
        return {
            fontName: "Main-Bold",
            fontClass: "mathbf",
        };
    }
};

const mathdefault = function(value, mode, options, classes) {
    if (/[0-9]/.test(value.charAt(0)) || contains(mathitLetters, value)) {
        return {
            fontName: "Main-Italic",
            fontClass: "mathit",
        };
    } else {
        return {
            fontName: "Math-Italic",
            fontClass: "mathdefault",
        };
    }
};

const retrieveTextFontName = function (fontFamily, fontWeight, fontShape) {
    let baseFontName = "";
    switch (fontFamily) {
        case "amsrm":
            baseFontName = "AMS";
            break;
        case "textrm":
            baseFontName = "Main";
            break;
        case "textsf":
            baseFontName = "SansSerif";
            break;
        case "texttt":
            baseFontName = "Typewriter";
            break;
        default:
            baseFontName = fontFamily; // use fonts added by a plugin
    }

    let fontStylesName;
    if (fontWeight === "textbf" && fontShape === "textit") {
        fontStylesName = "BoldItalic";
    } else if (fontWeight === "textbf") {
        fontStylesName = "Bold";
    } else if (fontWeight === "textit") {
        fontStylesName = "Italic";
    } else {
        fontStylesName = "Regular";
    }

    return `${baseFontName}-${fontStylesName}`;
};

// not sure what is group it seems like a node
// return a makeSymbol or a makeFragment
const makeOrd = function (group, options, type) {

    const mode = group.mode;
    const text = group.text;

    const classes = ["mord"]; // m ordinary

    // Math mode or Old font (i.e. \rm)
    // if mode is math, is font.
    // if mode is text and you have to provide the options.font
    // font will be provided by options.font
    // or the font will be set by the options fontfamily in math mode
    // and the text with options
    const isFont = mode === "math" || (mode === "text" && options.font);

    const fontOrFamily = isFont ? options.font : options.fontFamily;

    if (fontOrFamily) {

        let fontName;
        let fontClasses;

        // bold symbol
        // math normal
        if (fontOrFamily === "boldsymbol" || fontOrFamily === "mathnormal") {
            const fontData = fontOrFamily === "boldsymbol"
                ? boldsymbol(text, mode, options, classes)
                : mathnormal(text, mode, options, classes);
            fontName = fontData.fontName;
            fontClasses = [fontData.fontClass];
        } else if (contains(mathitLetters, text)) {
            fontName = "Main-Italic";
            fontClasses = ["mathit"];
        } else if (isFont) {
            fontName = fontMap[fontOrFamily].fontName;
            fontClasses = [fontOrFamily];
        } else {
            fontName = retrieveTextFontName(fontOrFamily, options.fontWeight,
                                            options.fontShape);
            fontClasses = [fontOrFamily, options.fontWeight, options.fontShape];
        }

        if (lookupSymbol(text, fontName, mode).metrics) {
            return makeSymbol(text, fontName, mode, options,
                classes.concat(fontClasses));
        }
    }

    // Makes a symbol in the default font for mathords and textords.
    if (type === "mathord") {
        const fontLookup = mathdefault(text, mode, options, classes);
        return makeSymbol(text, fontLookup.fontName, mode, options,
            classes.concat([fontLookup.fontClass]));
    } else if (type === "textord") {
        const font = symbols[mode][text] && symbols[mode][text].font;
        if (font === "ams") {
            const fontName = retrieveTextFontName("amsrm", options.fontWeight,
                  options.fontShape);
            return makeSymbol(
                text, fontName, mode, options,
                classes.concat("amsrm", options.fontWeight, options.fontShape));
        } else if (font === "main" || !font) {
            const fontName = retrieveTextFontName("textrm", options.fontWeight,
                  options.fontShape);
            return makeSymbol(
                text, fontName, mode, options,
                classes.concat(options.fontWeight, options.fontShape));
        } else { // fonts added by plugins
            const fontName = retrieveTextFontName(font, options.fontWeight,
                  options.fontShape);
            // We add font name as a css class
            return makeSymbol(
                text, fontName, mode, options,
                classes.concat(fontName, options.fontWeight, options.fontShape));
        }
    } else {
        throw new Error("unexpected type: " + type + " in makeOrd");
    }
};

module.exports = {makeOrd}
