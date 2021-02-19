const unicodeRegExp = /a-zA-Z/
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z${unicodeRegExp.source}]*`
const qnameCapture = `((?:${ncname}\\:)?${ncname})`

const startTagOpen = new RegExp(`^<${qnameCapture}`)
// group1 ( = 'group3' | "group4" | group5 )?
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
const startTagClose = /^\s*(\/?)>/

const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)

const doctype = /^<!DOCTYPE [^>]+>/i
const comment = /^<!\--/
const conditionalComment = /^<!\[/


module.exports = {attribute, unicodeRegExp, ncname, qnameCapture, startTagClose,
            startTagOpen, endTag, doctype, comment, conditionalComment}
