# nodemailer-express-handlebars-plaintext-inline-ccs
A plugin for nodemailer that uses express-handlebars view engine to generate emails, generates the plain text extracting the data from the HTML returned by the handlebars compiler and also injects the CSS inside `<script>` tags inside the HTML tags

This package is inspired by __[nodemailer-express-handlebars](https://github.com/yads/nodemailer-express-handlebars)__

This plugin works with nodemailer 6.x. It uses the next packages :
* __[express-handlebars](https://github.com/ericf/express-handlebars)__ view engine to generate html emails.
* __[html-to-text](https://www.npmjs.com/package/html-to-text)__ converter to generate text from the HTML returned by the view engine 
* __[juice](https://www.npmjs.com/package/html-to-text)__ converter to generate text from the HTML returned by the view engine 

# Install from npm
```bash
npm install nodemailer-express-handlebars-plaintext-inline-ccs
```
# Usage
```javascript
//reference the plugin
var hbs = require('nodemailer-express-handlebars-plaintext-inline-ccs');

const templatesFolder = './emailTemplates'

const options = {
    templatesDir: templatesFolder,
    plaintextOptions: {
      uppercaseHeadings: false
    }
  }

//attach the plugin to the nodemailer transporter
transporter.use('compile', hbs(options));
//send mail with options
var mail = {
   from: 'from@domain.com',
   to: 'to@domain.com',
   subject: 'Test',
   template: 'email',
   context: {
       name: 'Name'
   },
   attachments: [
      {
        filename: 'logo.png',
        path: './emailTemplates/logo.png',
        cid: 'logo@domain.com' // same cid value as in the html img src
      }
   ]
}
transporter.sendMail(mail);
```
## Plugin Options
The plugin expects the following options:
* __viewEngine (required)__ either the express-handlebars view engine instance or [options for the view engine](https://github.com/ericf/express-handlebars#configuration-and-defaults)
* __templatesDir (required)__ provides the path to the directory where your views are
* __extName__ the extension of the views to use (defaults to `.handlebars`)
* __plainTextOptions__ options for configuring the html-to-text generator - the one that outputs the plain text, [options for the html-to-text generator](https://www.npmjs.com/package/ html-to-text#options). By default plain text is generated, to disable set generatePlainText 
* __juiceOptions__ options for configuring the juice generator - the one that injects our CSS into the HTML tags [options for the juice generator](https://github.com/Automattic/juice#options)

## Mail options
Set the template and values properties on the mail object before calling `sendMail`
* __nodemailer-options__ see (https://nodemailer.com/message/) all options are supported and passed into nodemailer
aditionally the plugin implements
* __template__ the name of the template file to use
* __context__ this will be passed to the view engine as the context as well as view engine options see [here](https://github.com/ericf/express-handlebars#renderviewviewpath-optionscallback-callback)
* __useTemplate__ allows to disable the use of templates and handlebars (defaults to `true`), if it is `false` it uses the values of text and html passed
* __text__ The plaintext version of the message as an Unicode string, Buffer, Stream or an attachment-like object ({path: ‘/var/data/…'}) (defaults to `''`), when useTemplate is set to `false` or when `opts.plainTextOptions.generatePlainText = false`
* __html__ The HTML version of the message as an Unicode string, Buffer, Stream or an attachment-like object ({path: ‘http://…'}) (defaults to `''`), when useTemplate is set to `false`

## Handlerbars Template

The CSS on this file will be converted and included inside the HTML tags (`"<style>div{color:red;}</style><div/>"` -> `<div style="color: red;"></div>`)

```
<!DOCTYPE html
    PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>nodemailer-express-handlebars-plaintext-inline-ccs</title>
    <style type="text/css">
        body {
            margin: 0;
            padding: 0;
            min-width: 100% !important;
            font-family: Arial, sans-serif;
        }

        .content {
            width: 100%;
            max-width: 600px;
        }

        .td-container {
            font-size: 0px;
            padding: 10px 25px 10px 25px;
            word-break: break-word;
        }

        .div-container {
            font-family: Arial, sans-serif;
            font-size: 13px;
            letter-spacing: normal;
            line-height: 1;
            text-align: left;
            color: #000000;
        }

        .sub-title {
            color: #5e6977;
            font-size: 15px;
            font-weight: 700;
            line-height: 22px;
        }

        p {
            margin: 10px 0;
        }

        .p-divider {
            border-top: solid 2px #E6E6E6;
            font-size: 1;
            margin: 0px auto;
            width: 100%;
        }

        a {
            color: #0069a6;
        }

        body[yahoo] .class-name {}

        @media only screen and (min-device-width: 601px) {
            .content {
                width: 600px !important;
            }
        }
    </style>
</head>

<body bgcolor="#fff" yahoo>
    <table width="100%" bgcolor="#fff" border="0" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
            <td>
                <!--
                        Support for Outlook and Locus
                    -->
                <!--[if (gte mso 9)|(IE)]>
                    <table width="600" align="center" cellpadding="0" cellspacing="0" border="0" role="presentation">
                        <tr>
                            <td>
                <![endif]-->
                <table class="content" align="center" cellpadding="0" cellspacing="0" border="0" role="presentation">
                    {{> page/header}} <!-- templates located at emailTemplates\page\header.handlebars -->
                    <tr>
                        <td class='td-container'>
                            <div class='div-container'>
                                <p>
                                    <span class="sub-title">Name :</span> {{name}}
                                </p>
                            </div>
                        </td>
                    </tr>
                    {{> page/signature}} <!-- templates located at emailTemplates\page\signature.handlebars -->
                </table>
                <!--[if (gte mso 9)|(IE)]>
                        </td>
                    </tr>
                </table>
                <![endif]-->
            </td>
        </tr>
    </table>
</body>

</html>
```

# License
MIT