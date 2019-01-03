export class MailOptions {
  public from: string;
  public to: string;
  public cc: string;
  public bcc: string;
  public subject: string;
  public templates: {
    text: string | undefined,
    html: string | undefined,
  };
  public context: any;
  public attachments: any;
}