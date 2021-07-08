 
const nodemailer = require("nodemailer");
module.exports.sendemail = function(to, subject, text) {
  var remetente = nodemailer.createTransport({
    host: "smtp.champion.ind.br",
    port: 587,
    //secure: true,
    tls: {
        rejectUnauthorized:false
    },
    auth: {
      user: "parceiro@champion.ind.br",
      pass: "Champ@far@2020"
    }
  });

  // console.log(to);
  // console.log(subject);
  // console.log(text);

  var emailASerEnviado = {
    from: "parceiro@champion.ind.br",
    to: to,
    subject: subject,
    html: text
  };

  remetente.sendMail(emailASerEnviado, function(error) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email enviado com sucesso.");
    }
  });
};