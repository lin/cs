const Parser = require('../src/')

const html = `ddfs<!DOCTYPE dsfa><dd class="df&lt;"> dfsaf<div class="ak"> Title </div></dd>`

const visitor = {

  start ({tagName, attrs}) {
    console.log('starting the tagName: ' + tagName);
  },

  end ({tagName}) {
    console.log('closing the tagName: ' + tagName);
  },

  text (text) {
    // console.log('Plain Text ' + text);
  }

}


;(new Parser(html, visitor)).parse()
