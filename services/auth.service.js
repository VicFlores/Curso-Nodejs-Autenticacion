const boom = require('@hapi/boom');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const UserService = require('../services/user.service');
const { config } = require('../config/config');

const service = new UserService();

class authService {
  async getUser(email, password) {
    const user = await service.findEmail(email);
    if (!user) {
      throw boom.unauthorized();
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw boom.unauthorized();
    }
    delete user.dataValues.password;
    return user;
  }

  signToken(user) {
    const payload = {
      sub: user.id,
      role: user.role,
    };
    const token = jwt.sign(payload, config.tokenSecret);
    return {
      user,
      token,
    };
  }

  /* Step 1: Mandar email */
  async sendMail(infoMail) {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'vicsito2014@gmail.com',
        pass: 'pplmydqqtwdczvtm',
      },
    });

    await transporter.sendMail(infoMail);

    return { message: 'mail sent' };
  }

  /* Step 2: Generar link */
  async resetPassword(email) {
    const user = await service.findEmail(email);
    if (!user) {
      throw boom.unauthorized();
    }

    const payload = { sub: user.id };
    const token = jwt.sign(payload, config.tokenSecret, { expiresIn: '15min' });
    const link = `http://myfrontend.com/recovery?token=${token}`;

    await service.update(user.id, { recovery: token });

    const mail = {
      from: 'vicsito2014@gmail.com',
      to: `${user.email}`,
      subject: 'Email para recuperar contraseña',
      /* text: 'Hola, te pico la cola', */
      html: `<b>Ingresa a este link => ${link} </b>`,
    };

    const response = await this.sendMail(mail);
    return response;
  }

  /* Step 2: validar link */
  async changePassword(token, newPassword) {
    try {
      const payload = jwt.verify(token, config.tokenSecret);
      const user = await service.findOne(payload.sub);
      if (user.recovery !== token) {
        throw boom.unauthorized();
      }
      const hash = await bcrypt.hash(newPassword, 10);
      await service.update(user.id, { recovery: null, password: hash });
      return { message: 'Password changed' };
    } catch (error) {
      throw boom.unauthorized();
    }
  }
}

module.exports = authService;
