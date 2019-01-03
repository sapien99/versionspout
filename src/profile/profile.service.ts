import {HttpService, HttpException, HttpStatus, Injectable, Logger} from '@nestjs/common';
import { ProfileModel } from './models/profile.model';
import { ProfileInterface } from './models/profile.interface';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as _ from 'lodash';
import { DockerCompareRequestModel, DockerCompareResultModel } from '../docker/models/docker.model';
import { DockerVersionService } from '../docker/docker.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class ProfileService {

    /**
     * Save ProfileModel in db
     * @param profile
     */
    async createProfile(profile: ProfileModel) {        
        // save profilemodel in db
        const mongooseModel = new this.profileModel(profile);
        mongooseModel._id = profile.email;
        await mongooseModel.update({ upsert: true });                      
    }

    /**
     * Get ProfileModel from db
     * @param email email of the profiles user
     */
    async findProfile(email: string): Promise<ProfileModel | null> {        
        return null;
    }

    /**
     * Update existing ProfileModel
     * @param email email of the profiles user
     */
    async updateProfile(email: string, profile: ProfileModel): Promise<ProfileModel | null> {        
        // TODO: email must not be changed
        return null;
    }

    /**
     * Delete existing ProfileModel
     * @param email email of the profiles user
     */
    async deleteProfile(email: string) {        
        // TODO: email must exist
        return null;
    }

    /**
     * Get Version comparison for docker artifacts of this profile
     * @param email email of the profiles user
     */
    async inquireDockerVersions(email: string): Promise<DockerCompareResultModel[]> {        
        // TODO: fetch versions from database for the specified user
        return this._inquireDockerVersions([]);
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
