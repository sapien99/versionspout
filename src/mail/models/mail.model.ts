export class Mail {
  public from: string;
  public to: string;
  public cc: string;
  public bcc: string;
  public subject: string;
  public text: string | undefined;
  public html: string | undefined;
  public attachments: any;
}