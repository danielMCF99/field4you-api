import nodemailer, { SentMessageInfo, Transporter } from 'nodemailer';
import config from '../../config/env';
import { Mailer } from '../../domain/interfaces/Mailer';

export class MailerImplementation implements Mailer {
  private static instance: MailerImplementation;
  private mailTransporter: Transporter;

  private constructor() {
    this.mailTransporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: config.mailAccount,
        pass: config.mailPassword,
      },
    });
  }

  public static getInstance(): MailerImplementation {
    if (!MailerImplementation.instance) {
      MailerImplementation.instance = new MailerImplementation();
    }

    return MailerImplementation.instance;
  }

  async sendMail(
    to: string,
    subject: string,
    text: string
  ): Promise<SentMessageInfo> {
    try {
      return this.mailTransporter.sendMail({
        from: config.mailAccount,
        to: to,
        subject: subject,
        text: text,
      });
    } catch (error: any) {
      console.log(error.message);
      return false;
    }
  }
}
