import { Injectable, Inject } from '@nestjs/common';
import { MailConfigurationError } from './errors';
import * as nodemailer from 'nodemailer';
import * as _ from 'lodash';
import * as ejs from 'ejs';
import { promisify } from 'util';
import { Logger} from '@nestjs/common';
import { globals } from '../env';
import * as path from 'path';
import { MailOptions } from './models/mailoptions.model';
import { Mail } from './models/mail.model';

@Injectable()
export class MailService {

    private static singleton;
    private static transporter: any;
    private static _renderFile;

    private async compose(config: MailOptions, data: any): Promise<Mail> {
      const composedMail = new Mail();

      Logger.log('composing email to ', config.to);
      const textPath = path.join(globals.path.assets, config.templates.text);
      const htmlPath = path.join(globals.path.assets, config.templates.html);
      const emailData = _.merge({}, data, config.context || {});

      composedMail.from = config.from;
      composedMail.to = config.to;
      composedMail.cc = config.cc;
      composedMail.bcc = config.bcc;
      composedMail.subject = config.subject;
      composedMail.text = await MailService._renderFile(textPath, emailData);
      composedMail.html = await MailService._renderFile(htmlPath, emailData);
      composedMail.attachments = _.map(config.attachments, () => path.join(globals.path.assets, config.attachments));

      return composedMail;
    }

    public async send(mail: Mail) {
      await MailService.transporter.sendMail(mail);
      MailService.transporter.close();
    }

    public async verify() {
      if (globals.mail.host) {
        Logger.log('Verifying SMTP Connection');
        await MailService.transporter.verify();
        MailService.transporter.close();
      } else {
        Logger.warn('No SMTP server configured, some services will fail!');
      }
    }

    public async test() {
      await this.verify();
      if (process.env.TESTMAIL_TO) {
        const mail = new Mail();
        mail.to = process.env.TESTMAIL_TO;
        mail.from = 'webmaster@summit15.com';
        mail.subject = 'Testmail';
        mail.html = '<b>Testmail sent successfully</b>';
        await MailService.get().send(mail);
      }

    }

    public static async bootstrap(): Promise<any> {
      if (!MailService.singleton)
        MailService.singleton = new MailService();
      if (process.env.TESTMAIL_TO) {
        return MailService.singleton.verify();
      }
    }

    public static get(): MailService {
      if (!MailService.singleton)
        MailService.singleton = new MailService();
      return MailService.singleton;
    }

    constructor() {

      const smtpOptions = {
        host: globals.mail.host,
        port: globals.mail.port,
        secure: globals.mail.secure,
        requireTLS: true,
        auth: globals.mail.secure ? {
          user: globals.mail.user,
          pass: globals.mail.password,
        } : undefined,
        connectionTimeout: globals.mail.connectionTimeout,
        socketTimeout: globals.mail.socketTimeout,
        greetingTimeout: globals.mail.greetingTimeout,
        logger: true,
      };

      MailService.transporter = nodemailer.createTransport(smtpOptions as any);

      Logger.log(`creating mail transporter with options ${smtpOptions}`);
      MailService._renderFile = promisify(ejs.renderFile);
    }

}
