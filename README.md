dpd-email
=========

A simple DPD resource for sending emails using nodemailer and mu2 templates.

This Deployd resource is an alternative to the [dpd-email](https://github.com/deployd/dpd-email) resource that leaves more power to the actual event script and uses the [Mu templating engine](https://github.com/raycmorgan/Mu). This resource works fine with most SMTP servers, including Gmail. The difference between this resource and dpd-email is that here we use the mu2 engine, and the template can be conveniently entered in the config page of the resource, rather than having to copy the templates to the `resources` directory.

Here is an example event script:

```node
	if (!body.email) {
	    cancel("No recipient address provided", 400);
    
	/** Imagine a template like this:
	
	Hi, {{userName}}, wellcome to dpd-email!
	
	*/
	var view = {  userName: body.userName
	        };
	var renderedText = '';
	
	mustache.renderText(template, view)
      .on('data', function (data) {
        renderedText += data.toString();
      })
      .on('end', function () {
          var mailOptions = {
              from: "Me <me@me.com>",
              to: body.email,
              subject: body.userName + " has sent you an email!",
              text: renderedText
          };
          mailer.sendMail(mailOptions, function(error, response){
              if (error){
                  console.log("Failed to send email: "+error);
                  cancel("Failed to send email: "+error, 500);
              }
          
              respond(response);
          });
      });
```

An event script can access the templating engine as `mustache` and the mail object as `mail`. See the mu2 and nodemailer documentations for more details on how to use them.

