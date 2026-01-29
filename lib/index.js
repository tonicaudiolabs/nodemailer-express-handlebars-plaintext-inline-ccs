import TemplateGenerator from './generator'

export default function (options) {
  const generator = new TemplateGenerator(options)

  return function (mail, cb) {
    generator.render(mail, cb)
  }
}
