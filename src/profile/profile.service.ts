import {HttpService, HttpException, HttpStatus, Injectable, Logger} from '@nestjs/common';
import { ProfileModel } from './models/profile.model';
import { ProfileInterface } from './models/profile.interface';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as async from 'async';
import * as drc from 'docker-registry-client';
import * as _ from 'lodash';
import { DockerCompareResultModel } from 'docker/models/docker-compare-result.model';
import { MailService } from 'mail/mail.service';

@Injectable()
export class ProfileService {

    /**
     * Save ProfileModel in db
     * @param profile
     */
    async createProfile(profile: ProfileModel) {        
        // save profilemodel in db
        // const createdProfile = new this.profileModel(profile);
        // return await createdProfile.save();
        return null;
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
    async inquireDockerVersions(email: string): Promise<DockerCompareResultModel> {        
        return null;
    }

    // constructor(private readonly httpService: HttpService,
    //    @InjectModel('ProfileModel') private readonly profileModel: Model<ProfileInterface>) {}
    constructor(private readonly mailService: MailService) {}

}
