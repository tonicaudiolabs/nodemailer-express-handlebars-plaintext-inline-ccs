import TemplateGenerator from './generator.js'

export default function hbs(options) {
  const generator = new TemplateGenerator(options)

  return function (mail, cb) {
    generator.render(mail, cb)
  }
}
