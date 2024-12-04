export interface Mailer {
  sendMail(to: string, text: string): Promise<boolean>;
}
