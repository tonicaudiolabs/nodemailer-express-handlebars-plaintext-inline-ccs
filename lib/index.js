'use strict'

var TemplateGenerator = require('./generator')

module.exports = function (options) {
  const generator = new TemplateGenerator(options)

  return function (mail, cb) {
    generator.render(mail, cb)
  }
}
