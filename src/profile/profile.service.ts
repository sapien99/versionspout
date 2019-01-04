import {HttpService, HttpException, HttpStatus, Injectable, Logger} from '@nestjs/common';
import { ProfileModel } from './models/profile.model';
import { ProfileInterface } from './models/profile.interface';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as _ from 'lodash';
import { DockerCompareRequestModel, DockerCompareResultModel } from '../docker/models/docker.model';
import { DockerVersionService } from '../docker/docker.service';
import { MailService } from '../mail/mail.service';
import { MailOptions, Mail } from '../mail/models/mail.model';

@Injectable()
export class ProfileService {
    
    /**
     * Save ProfileModel in db
     * @param profile
     */
    async createProfile(profile: ProfileModel) {        
        // TODO: send email about create
        // save profilemodel in db       
        const resp = await this.profileModel.findByIdAndUpdate( profile.email, profile, { upsert: true } );
        
        const mailOptions = new MailOptions();
        mailOptions.to = profile.email;
        mailOptions.subject = 'Welcome on summit15';
        mailOptions.template = 'signup'                    
        this.mailService.send(await this.mailService.compose(mailOptions, profile ));
        
        resp.notificationMailSent = true;        
        return resp;
    }

    /**
     * Get ProfileModel from db
     * @param email email of the profiles user
     */
    async findProfile(email: string): Promise<ProfileModel | null> {        
        // TODO: check permission
        return this.profileModel.findById( email );
    }

    /**
     * Update existing ProfileModel
     * @param email email of the profiles user
     */
    async updateProfile(email: string, profile: ProfileModel): Promise<ProfileModel | null> {                
        // TODO: send email about update
        // TODO: check permission
        return this.profileModel.findByIdAndUpdate( email, profile );
    }

    /**
     * Delete existing ProfileModel
     * @param email email of the profiles user
     */
    async deleteProfile(email: string) {        
        // TODO: send email about delete       
        const profile = await this.profileModel.findById( email );
        if (!profile)
            throw new HttpException('Profile not found', HttpStatus.NOT_FOUND); 
        return this.profileModel.findByIdAndRemove( email );
    }

    /**
     * Get Version comparison for docker artifacts of this profile
     * @param email email of the profiles user
     */
    async inquireDockerVersions(email: string): Promise<DockerCompareResultModel[]> {        
        // TODO: permission
        const profile = await this.profileModel.findById( email );
        if (!profile)
            throw new HttpException('Profile not found', HttpStatus.NOT_FOUND);
        return this._inquireDockerVersions(profile.dockerVersions);
    }

    /**
     * Get Version comparison for docker artifacts of this profile
     * @param email email of the profiles user
     */
    async sendNewsMail(email: string): Promise<any> {                
        const profile = await this.profileModel.findById( email );
        if (!profile)
            throw new HttpException('Profile not found', HttpStatus.NOT_FOUND);
        const dockerVersions = await this._inquireDockerVersions(profile.dockerVersions);

        const mailOptions = new MailOptions();
        mailOptions.to = profile.email;
        mailOptions.subject = 'Your docker news';
        mailOptions.template = 'news'                            
        this.mailService.send(await this.mailService.compose(mailOptions, { profile, dockerVersions }));

        return ;
    }

    /**
     * Private Version comparison for docker artifacts of this profile - used for being directly callable for testing
     * @param email email of the profiles user
     */
    async _inquireDockerVersions(dockerVersions: DockerCompareRequestModel[]): Promise<DockerCompareResultModel[]> {        
        return this.dockerVersionService.fetchAndCompareMany(dockerVersions);                
    }

    constructor(        
        @InjectModel('Profile') private readonly profileModel: Model<ProfileInterface>,
        private readonly dockerVersionService: DockerVersionService,
        private readonly mailService: MailService) {}

}
