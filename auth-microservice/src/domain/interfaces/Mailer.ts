export interface Mailer {
  sendMail(to: string, subject: string, text: string): Promise<boolean>;
}
