'use strict'

const path = require('path')
const handlebars = require('express-handlebars')
 import { htmToText } from 'html-to-text'
const juice = require('juice')

const setPlainTextDefaults = ({
  generatePlainText = true,
  ...object
} = {}) => ({ ...object, generatePlainText })

const setViewEngineDefaults = ({ defaultLayout = false, ...object } = {}, templateOptions) => {
  !object.extName && templateOptions.extName && (object.extName = templateOptions.extName)
  !object.partialsDir && templateOptions.templatesDir && (object.partialsDir = templateOptions.templatesDir)
  !object.layoutsDir && templateOptions.templatesDir && (object.layoutsDir = templateOptions.templatesDir)
  templateOptions.defaultLayout && (defaultLayout = templateOptions.defaultLayout)
  return { ...object, defaultLayout }
}

/**
 * Generate Template Generator.
 * @param {Object} opts - Options for configuring the template
 * @param {Object} opts.viewEngine - (required) either the express-handlebars view engine instance or options for the view engine (https://github.com/ericf/express-handlebars#configuration-and-defaults)
 * @param {String} opts.extName - (optional) extension used for the handlebars templates
 * @param {String} opts.templatesDir - (optional) provides the path to the directory where templates are stored
 * @param {String} opts.defaultLayout - (optional) layout to be used as default for all the templates, by default no layout is used
 * @param {Object} opts.plainTextOptions - (optional) options for configuring the html-to-text generator, the one that outputs the plain text (https://www.npmjs.com/package/html-to-text#options)
 * @param {Object} opts.juiceOptions - (optional) options for configuring the juice generator, the one that injects our CSS into the HTML tags (https://github.com/Automattic/juice#options)
 */
const TemplateGenerator = function (opts) {
  this.templatesDir = opts.templatesDir
  this.extName = opts.extName || '.handlebars'
  var viewEngine = setViewEngineDefaults(opts.viewEngine, opts)
  if (!viewEngine.renderView) {
    viewEngine = handlebars.create(viewEngine)
  }
  this.viewEngine = viewEngine
  this.plainTextOptions = setPlainTextDefaults(opts.plainTextOptions)
  this.juiceOptions = opts.juiceOptions || {}
}

/**
 * Render Template.
 * @param {Object} mail - object received from nodemailer to be filled with the generated HTML and plain text if set, and other fields to send the email
 * @param {String} mail.data - Object to be passed into nodemailer, options see (https://nodemailer.com/message/)
 * @param {String} mail.data.template - the name of the template file to use
 * @param {Object} mail.data.context - this will be passed to the view engine as the context as well as view engine options see (https://github.com/ericf/express-handlebars#renderviewviewpath-optionscallback-callback)
 * @param {String} mail.data.context.layout - (optional) Layout to be used for the templated provided, This overrides any defaultLayout value
 * @param {Boolean} mail.data.useTemplate - (optional) allows to disable the use of templates and handlebars
 * @param {requestCallback} cb - callback to be fired once the email is ready to be sent
 */
TemplateGenerator.prototype.render = function render (mail, cb) {
  const _useTemplate = !!(mail.data.useTemplate || true)
  mail.data.text = mail.data.text || ''

  // If the mail already has html data we skip the whole process as we don't have anyhting to process
  if (mail.data.html) return cb()

  // If generate template is disabled we skip the whole process and check if we have html or we set it to empty string to avoid errors
  if (!_useTemplate) {
    mail.data.html = mail.data.html || ''
    return cb()
  }

  const templatePath = path.join(this.templatesDir, mail.data.template + this.extName)

  this.viewEngine.renderView(templatePath, mail.data.context, (err, body) => {
    if (err) return cb(err)

    /**
    // body - HTML generated from our handlebars templates
    // juiceOptions - Options passed into the juice generator, The one that injects our CSS into the HTML tags (https://github.com/Automattic/juice#options)
    // inlinedHtml - HTML returned by juice with the CSS injected
     */
    juice.juiceResources(body, this.juiceOptions, (err, inlinedHtml) => {
      if (err) {
        return cb(err)
      }
      mail.data.html = inlinedHtml

      // If plain text from the generated HTML is needed
      if (this.plainTextOptions.generatePlainText) {
        // Converter receives HTML and options (check setPlainTextDefaults for defaults)
        mail.data.text = htmToText(body, this.plainTextOptions)
        // mail.data.text = mail.data.text.replace(/(\n)\[cid:.*?\] |\[cid:.*?\]/g, '$1') //Commented but preserved in case it is needed on the future for some fix
      }
      cb()
    })
  })
}

module.exports = TemplateGenerator
