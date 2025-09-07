const nodemailer = require('nodemailer');
const fs = require('fs');
const conf = JSON.parse(fs.readFileSync('email.json'));

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: conf.mailFrom,
    pass: conf.mailSecret,
  },
});


const result = {
   send: async (email, from, subject, text) => {
      try {
         return await transporter.sendMail({
            from: from,
            to: email,
            subject: subject,
            text: text 
          })
      } catch (error) {
         //console.log(error);
      } 
   },
   test: async () => {
      return transporter.verify();
   }
}

module.exports = result;