import nodemailer from 'nodemailer';
import { UserDocument } from "../models/User";

export class Email {

  constructor() { }

  static getTransporter() {
    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  static sendVerificationCode(user: UserDocument) {
    return new Promise((resolve, reject) => {
      const code = Math.floor(100000 + Math.random() * 999999);
      const transporter = this.getTransporter();

      const mailOptions = {
        subject: 'Activation Email',
        to: `${user.profile.name} <${user.email}>`,
        from: `<${process.env.SENDER_EMAIL}>`,
        text: `Hello ${user.profile.name}, Please use the code: ${code} to activate your account.`,
        html: `<p>Hello ${user.profile.name}, </p><p>Please use the code: <b>${code}</b> to activate your account.</p>`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          reject(error);
        } else {
          resolve(code);
        }
      });
    });
  }

  static sendPasswordResetCode(user: UserDocument) {
    return new Promise((resolve, reject) => {
      const code = Math.floor(100000 + Math.random() * 999999);
      const transporter = this.getTransporter();

      const mailOptions = {
        subject: 'Password Reset',
        to: `${user.profile.name} <${user.email}>`,
        from: `<${process.env.SENDER_EMAIL}>`,
        text: `Hello ${user.profile.name}, Please use the code: ${code} to reset your password.`,
        html: `<p>Hello ${user.profile.name}, </p><p>Please use the code: <b>${code}</b> to reset your password.</p>`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          reject(error);
        } else {
          resolve(code);
        }
      });
    });
  }
}