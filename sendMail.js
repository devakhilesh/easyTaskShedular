const nodemailer = require("nodemailer")

exports.sendMail = async (mailOptions)=>{
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: "akhileshsoni098@gmail.com",
          // user:"Developer.lizmy@gmail.com",
          // pass:"kazjbnsgztjnuorh",
          pass: "mmniykdhbktdlspx",
        },
      });

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log('Error sending email:', error.message);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });

}

