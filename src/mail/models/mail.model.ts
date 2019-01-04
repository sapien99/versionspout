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

export class MailOptions {
  public from: string;
  public to: string;
  public cc: string | undefined;
  public bcc: string | undefined;
  public subject: string;
  public template: string;    
  public context: any;
  public attachments: any;
}