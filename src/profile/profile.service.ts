import { HttpException, HttpStatus, Injectable, Logger, HttpService} from '@nestjs/common';
import { IUserProfile, INotificationStatus, NotificationStatus, DockerVersionProfile } from './models/profile.model';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as _ from 'lodash';
import { DockerVersionMatch, IDockerTag, IDockerImage, DockerImage } from '../docker/models/docker.model';
import { DockerService } from '../docker/docker.service';
import { MailService } from '../mail/mail.service';
import { MailOptions } from '../mail/models/mail.model';

@Injectable()
export class ProfileService {
    
    /**
     * Save ProfileModel in db
     * @param profile
     */
    async createProfile(profile: IUserProfile) {                
        // save profilemodel in db       
        let resp = await this.profileModel.findByIdAndUpdate( profile.email, profile, { upsert: true, new: true, setDefaultsOnInsert: true } );                
        Logger.log(`Profile ${profile.email} touched`);
        
        const mailOptions = new MailOptions();
        mailOptions.to = profile.email;
        mailOptions.subject = 'Welcome on summit15';
        mailOptions.template = 'signup'                    
        this.mailService.send(await this.mailService.compose(mailOptions, {profile: profile}, true ));
        resp.notificationMailSent = true;
        
        return resp;
    }

    /**
     * Get ProfileModel from db
     * @param email email of the profiles user
     */
    async findProfile(email: string): Promise<IUserProfile | null> {        
        // TODO: check permission
        return this.profileModel.findById( email );
    }

    /**
     * Update existing ProfileModel
     * @param email email of the profiles user
     */
    async updateProfile(email: string, profile: IUserProfile): Promise<IUserProfile | null> {                
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
     * Get Version comparison for docker artifacts of this profile. This one
     * is stateless and will return the matching versions
     * @param email email of the profiles user
     */
    async inquireDockerVersions(email: string): Promise<IDockerImage[]> {
        const profile: IUserProfile = await this.profileModel.findById( email );
        if (!profile)
            throw new HttpException('Profile not found', HttpStatus.NOT_FOUND);                    
        return this._inquireDockerVersionsForChannel(profile, 'ws', false);
    }                        

    /**
     * Get Version comparison for docker artifacts of this profile. This one
     * is stateful and will return only the ones not sent before
     * @param email email of the profiles user
     */
    async inquireDockerVersionNews(email: string): Promise<IDockerImage[]> {
        const profile: IUserProfile = await this.profileModel.findById( email );
        if (!profile)
            throw new HttpException('Profile not found', HttpStatus.NOT_FOUND);                    
        const dockerVersions = await this._inquireDockerVersionsForChannel(profile, 'ws', true);
        // now create status objects and save them
        await Promise.all(dockerVersions.map((image) => {
            return Promise.all(image.tags.map((tag) => {
                const status = new NotificationStatus(profile.email, 'ws', image.image, tag.tag);                
                return this.notifcationstatusModel.findByIdAndUpdate( status._id, status, { upsert: true, new: true, setDefaultsOnInsert: true});                                                                                    
            }));
        }));
        return dockerVersions;
    }                        

    /**
     * Private Version comparison for docker artifacts of this profile - used for being directly callable for testing
     * @param email email of the profiles user
     */
    async _inquireDockerVersions(subscribedDockerVersions: DockerVersionMatch[]): Promise<IDockerImage[]> {        
        return this.dockerVersionService.fetchAndCompareMany(subscribedDockerVersions);                
    }

    /* get the docker versions for a certain channel */
    async _inquireDockerVersionsForChannel(profile: IUserProfile, channel: string, delta: boolean): Promise<IDockerImage[]> {                                
        const versions: IDockerImage[] = await this._inquireDockerVersions(profile.subscribedDockerVersions);
        return _.without(await Promise.all(versions.map(async (dockerImage: DockerImage) => {

            // get request to read channels
            const requirement: DockerVersionProfile = this._getSubscribedDockerVersion(profile, dockerImage)
            let validNotificationChannels = requirement.notificationChannels;
            if (!validNotificationChannels || validNotificationChannels.length == 0) validNotificationChannels = profile.defaults.notificationChannels || [];
            // add the webservice channel in all cases - is used for the inquire via rest
            validNotificationChannels.push('ws');
            // if not matching the channel skip the whole image
            if (validNotificationChannels.indexOf(channel) == -1) {
                return null;
            } 
            let ignorePatterns = requirement.ignorePatterns;
            if (!ignorePatterns || ignorePatterns.length == 0)
                ignorePatterns = profile.defaults.ignorePatterns || [];                                    
            // if in "delta mode" we just return the tags since the last call            
            dockerImage.tags = _.without(await Promise.all(dockerImage.tags.map((tag) => this._checkNotificationStatus(
                profile, // profile
                channel, 
                dockerImage.image, 
                tag, // the whole tag object
                ignorePatterns, // regex which non-semver versions are allowed                                
                delta,                
                requirement.semverRange.length > 0
                ))), null);            

            return dockerImage;
        })), null);
    }

    _getSubscribedDockerVersion(profile: IUserProfile, image: IDockerImage): DockerVersionProfile {
        return profile.subscribedDockerVersions.find((img) => {
            return img.image === image.image 
              && img.repository === image.repository              
        });
    }

    /**
     * Email notifications
     * @param profile 
     */
    async _handleMailNotification(profile: IUserProfile) {
        // care about mail - send a summary if we have any news
        let dockerVersions = await this._inquireDockerVersionsForChannel(profile, 'mail', true);
        dockerVersions = dockerVersions.filter((image) => image.tags.length > 0);
        if (dockerVersions.length > 0) {
            const mailOptions = new MailOptions();
            mailOptions.to = profile.email;
            mailOptions.subject = 'Your docker news';
            mailOptions.template = 'news'                            
            this.mailService.send(await this.mailService.compose(mailOptions, { profile, dockerVersions }, profile.htmlEmail));            
            // now create status objects and save them
            await Promise.all(dockerVersions.map((image) => {
                return Promise.all(image.tags.map((tag) => {
                    const status = new NotificationStatus(profile.email, 'mail', image.image, tag.tag);                
                    return this.notifcationstatusModel.findByIdAndUpdate( status._id, status, { upsert: true, new: true, setDefaultsOnInsert: true});                                                                                    
                }));
            }));
        }        
    }

    /**
     * Save NotificationStatus object and return it if it was newly created - or null otherwise
     * @param profile 
     * @param channel 
     * @param image 
     * @param tag 
     */
    async _checkNotificationStatus(profile: IUserProfile, channel:string, image:string, tag: IDockerTag, ignorePatterns: string[], forceState:boolean, forceSemver:boolean) {                                
        console.log('CheckNotificationStatus called with', ignorePatterns)                
        // ignore everything matching a regex in the ignorepatterns        
        if (forceSemver && !tag.isSemver)
            return null;
        if (_.some(ignorePatterns, (pattern) => tag.tag.match(new RegExp(pattern))))
            return null;        
        if (forceState) {
            const status = new NotificationStatus(profile.email, channel, image, tag.tag);                
            const notificationStatus = await this.notifcationstatusModel.findById( status._id, status, { upsert: true, new: false, setDefaultsOnInsert: true })
            if (notificationStatus == null) // notificationstatus was newly created and therefor not existing
                return tag;
        }
        return tag;
    }

    /**
     * Additionan Notifications (webhook etc.)
     * @param profile 
     */
    async _handlAdditinalNotifications(profile: IUserProfile) {
        // care about webhooks - call them fire and forget
        const versions = await Promise.all(profile.notificationChannels.map(async (channel) => {
            if (channel.type == 'mail') 
                return [];
            return await this._inquireDockerVersionsForChannel(profile, channel.name, true);
        }));
        profile.notificationChannels.map(async (channel, index) => {                        
            if (channel.type == 'webhook') {                
                return Promise.all(versions[index].map((image) => {
                    return Promise.all(image.tags.map((tag) => {
                        channel.config.method = 'POST'
                        channel.config.data = {
                            image: {
                                repository: image.repository,
                                name: image.image
                            },
                            tag: {
                                name: tag.tag,
                                hash: tag.hashes,
                                created: tag.created
                            }
                        };
                        return this.httpService.axiosRef(channel.config)
                        .then(async () => {
                            Logger.log(`webhook ${channel.config.url} of channel ${channel.name} called because ${image.image}:${tag.tag}`);
                            const status = new NotificationStatus(profile.email, channel.name, image.image, tag.tag);                
                            await this.notifcationstatusModel.findByIdAndUpdate( status._id, status, { upsert: true, new: true, setDefaultsOnInsert: true});                                                                                    
                        })
                        .catch(async (e) => {
                            Logger.error(`problems calling webhook ${channel.config.url} of channel ${channel.name}, (called because ${image.image}:${tag.tag}): ${e.message}`);                            
                        })
                    }));
                }));                
            }
        });  
    }

    /**
     * Get Version comparison for docker artifacts of this profile
     * @param email email of the profiles user
     */
    async doNotifications(email: string) {                        
        const profile: IUserProfile = await this.profileModel.findById( email );
        if (!profile)
            throw new HttpException('Profile not found', HttpStatus.NOT_FOUND);                    
        // mail notifications
        this._handleMailNotification(profile);        
        // webhook notifications
        this._handlAdditinalNotifications(profile);      
    }

    constructor(                
        @InjectModel('UserProfile') private readonly profileModel: Model<IUserProfile>,        
        @InjectModel('NotificationStatus') private readonly notifcationstatusModel: Model<INotificationStatus>,        
        private readonly dockerVersionService: DockerService,
        private readonly httpService: HttpService,
        private readonly mailService: MailService) {}

}
