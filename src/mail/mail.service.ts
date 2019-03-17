import { Injectable, Inject } from '@nestjs/common';
import { MailConfigurationError } from './errors';
import * as nodemailer from 'nodemailer';
import * as _ from 'lodash';
import * as ejs from 'ejs';
import { promisify } from 'util';
import { globals } from '../env';
import * as path from 'path';
import { MailOptions, Mail } from './models/mail.model';
import { Logger } from '../logger';

@Injectable()
export class MailService {

    private static singleton;
    private static transporter: any;
    private static _renderFile;

    public async compose(config: MailOptions, data: any, sendHtmlMail: boolean): Promise<Mail> {
      const composedMail = new Mail();

      Logger.info('composing email to ', config.to);
      const textPath = path.join(globals.path.assets, 'mailtemplates', config.template, 'text.ejs');
      const htmlPath = path.join(globals.path.assets, 'mailtemplates', config.template, 'html.ejs');
      const emailData = _.merge({}, data, config.context || {});

      composedMail.from = globals.mail.from || config.from;
      composedMail.to = globals.mail.to || config.to;
      composedMail.cc = globals.mail.cc || config.cc;
      composedMail.bcc = globals.mail.bcc || config.bcc;
      composedMail.subject = globals.mail.subject || config.subject;      
      composedMail.text = await MailService._renderFile(textPath, emailData);      
      if (sendHtmlMail) {
        composedMail.html = await MailService._renderFile(htmlPath, emailData);
        composedMail.attachments = _.map(globals.mail.attachments || config.attachments, (attachment) => {
          return {
            path: path.join(globals.path.assets, 'mailtemplates', 'images', attachment),
            cid: 'header'
          }
        });
      }

      return composedMail;
    }

    public async send(mail: Mail) {
      await MailService.transporter.sendMail(mail);
      MailService.transporter.close();
    }

    public async verify() {
      if (globals.mail.host) {
        Logger.info('Verifying SMTP Connection');
        await MailService.transporter.verify();
        MailService.transporter.close();
      } else {
        Logger.warn('No SMTP server configured, some services will fail!');
      }
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
      Logger.info(`creating mail transporter with options ${smtpOptions}`);
      MailService._renderFile = promisify(ejs.renderFile);
    }

}
