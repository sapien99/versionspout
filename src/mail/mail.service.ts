import {HttpService, HttpException, HttpStatus, Injectable, Logger} from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as async from 'async';
import * as drc from 'docker-registry-client';
import * as _ from 'lodash';
import { DockerCompareResultModel } from 'docker/models/docker-compare-result.model';
import { MailRequest } from './models/mail-request.model';
import { MailStatus } from './models/mail-status.model';

@Injectable()
export class MailService {

    /**
     * send Mail     
     */
    async sendMail(mailData: MailRequest): Promise<MailStatus> {        
        return new MailStatus();
    }

    // constructor(private readonly httpService: HttpService,
    //    @InjectModel('ProfileModel') private readonly profileModel: Model<ProfileInterface>) {}
    constructor(private readonly mailService: MailService) {}

}
