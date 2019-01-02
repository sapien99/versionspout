export class MailRequest {
    
    // the list of recipients
    readonly recipient: string[];
    // cc
    readonly cc: string[];
    // bcc
    readonly bcc: string[];    
    // the referenced email-template
    readonly template: string;
    // a map of variables to resolve the template
    readonly variables: any;    

}
