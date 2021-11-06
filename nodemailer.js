const nodemailer = require('nodemailer');

async function main() {
  let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'vicsito2014@gmail.com',
      pass: 'pplmydqqtwdczvtm',
    },
  });

  let info = await transporter.sendMail({
    from: 'vicsito2014@gmail.com',
    to: 'ferrivas127@gmail.com',
    subject: 'Correo de prueba',
    text: 'Hola, te pico la cola',
    html: '<b>El santi</b>',
  });

  console.log('Message sent: %s', info.messageId);

  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
}

main().catch(console.error);
