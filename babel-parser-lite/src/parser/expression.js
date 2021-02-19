const {NodeUtils} = require('./node')

class ExpressionParser extends NodeUtils {}

Object.assign(ExpressionParser.prototype,
  require('./expr/atom'),
  require('./expr/function'),
  require('./expr/literal'),
  require('./expr/new'),
  require('./expr/object'),
  require('./expr/sub'),
  require('./expr/template'),
  require('./expr/top'),
)
