import { Mailer } from '../../domain/interfaces/Mailer';
import config from '../../config/env';
import { SentMessageInfo } from 'nodemailer';

export class MailerImplementation implements Mailer {
  private static instance: MailerImplementation;

  private constructor() {}

  public static getInstance(): MailerImplementation {
    if (!MailerImplementation.instance) {
      MailerImplementation.instance = new MailerImplementation();
    }

    return MailerImplementation.instance;
  }

  async sendMail(to: string, text: string): Promise<SentMessageInfo> {
    try {
      return config.mailTransporter.sendMail({
        from: config.mailAccount,
        to: to,
        subject: 'Password recovery for Field4You App',
        text: text,
      });
    } catch (error: any) {
      console.log(error.message);
      return false;
    }
  }
}
