var Resource = require('deployd/lib/resource')
  , Script = require('deployd/lib/script')
  , util = require('util')
  , nodemailer = require("nodemailer")
  , mu = require('mu2');

function EmailResource() {
    Resource.apply(this, arguments);
}
util.inherits(EmailResource, Resource);

EmailResource.label = "Email";
EmailResource.events = ["post"];
EmailResource.basicDashboard = {
  settings: [{
      name: 'servicename'
    , type: 'text'
    , description: 'A name of a common email service recognised by Nodemailer, e.g. Gmail, Hotmail, SendGrid etc. [optional]'
  }, {
      name: 'servername'
    , type: 'text'
    , description: 'URL or address of an SMTP server, if not using a common service [optional]'
  }, {
      name: 'username'
    , type: 'text'
    , description: 'Username for basic auth on SMTP server'
  }, {
      name: "password"
    , type: 'text'
    , description: 'Password for authentication'
  }, {
      name: "textTemplate"
    , type: 'textarea'
    , description: 'Email template'
  }, {
      name: "htmlTemplate"
    , type: 'textarea'
    , description: 'Email template'
  }, {
      name: "noSSL"
    , type: 'checkbox'
    , description: 'Whether to disable SSL (default: NO, ie SMTP via SSL)'
  }]
};

module.exports = EmailResource;

EmailResource.prototype.clientGeneration = true;

EmailResource.prototype.handle = function (ctx, next) {
    var parts = ctx.url.split('/').filter(function(p) { return p; });
    if (ctx.method === "POST" && this.events.post) {

        var config = {
                auth: {
                    user: this.config.username,
                    pass: this.config.password
                }
            };
        if (this.config.servicename) {
            config.service = this.config.servicename;
        } else {
            config.host = this.config.servername;
            if (this.config.noSSL) {
                config.secureConnection = false;
                config.port = 25;
            } else {
                config.secureConnection = true;
                config.port = 465;
            }
        }

        var smtpTransport = nodemailer.createTransport("SMTP", config);
        var domain = {
              url: ctx.url
            , parts: parts
            , query: ctx.query
            , body: ctx.body
            , respond: function (result) {
                smtpTransport.close();
                ctx.done(null, result);
            }
            , mailer: smtpTransport
            , mustache: mu
            , textTemplate: this.config.textTemplate
            , htmlTemplate: this.config.htmlTemplate
        };

        this.events.post.run(ctx, domain, function(err) {
            if (err) {
                smtpTransport.close();
                ctx.done(err);
            }
        });
    } else {
        next();
    }
};