import { globals } from './../env';
import { HttpException, HttpStatus, Injectable, HttpService, Inject } from '@nestjs/common';
import { IUserProfile, INotificationStatus, NotificationStatus, UserVersionProfile } from './models/profile.model';
import { Model } from 'mongoose';
import * as _ from 'lodash';
import { VersionManifest, IVersionTag, IVersionManifest, IVersionFilter } from '../version/models/version.model';
import { VersionService } from '../version/version.service';
import { MailService } from '../mail/mail.service';
import { MailOptions } from '../mail/models/mail.model';
import { Logger } from '../logger';
import { Z_FILTERED } from 'zlib';

@Injectable()
export class ProfileService {
    
    /**
     * Save ProfileModel in db
     * @param profile
     */
    async createProfile(profile: IUserProfile) {                
        // save profilemodel in db       
        let resp = await this.profileModel.findByIdAndUpdate( profile.email, profile, { upsert: true, new: true, setDefaultsOnInsert: true } );                
        Logger.info(`Profile ${profile.email} touched`);
        
        if (globals.mail.enabled) {
            const mailOptions = new MailOptions();
            mailOptions.to = profile.email;
            mailOptions.subject = 'Welcome to versionspout';
            mailOptions.template = 'signup'                    
            this.mailService.send(await this.mailService.compose(mailOptions, {profile: profile}, true ));
            resp.notificationMailSent = true;
        }
        
        return resp;
    }

    /**
     * Get ProfileModel from db
     * @param email email of the profiles user
     */
    async findProfile(email: string): Promise<IUserProfile | null> {        
        // TODO: use guard to check permission
        return this.profileModel.findById( email );
    }

    /**
     * Update existing ProfileModel
     * @param email email of the profiles user
     */
    async updateProfile(email: string, profile: IUserProfile): Promise<IUserProfile | null> {                        
        // TODO: use guard to check permission
        return this.profileModel.findByIdAndUpdate( email, profile );
    }

    /**
     * Delete existing ProfileModel
     * @param email email of the profiles user
     */
    async deleteProfile(email: string) {        
        // TODO: use guard to check permission        
        const profile = await this.profileModel.findById( email );
        if (!profile)
            throw new HttpException('Profile not found', HttpStatus.NOT_FOUND); 

        if (globals.mail.enabled) {
            const mailOptions = new MailOptions();
            mailOptions.to = profile.email;
            mailOptions.subject = 'You deleted your account on versionspout';
            mailOptions.template = 'delete'                    
            this.mailService.send(await this.mailService.compose(mailOptions, {profile: profile}, true ));            
        }

        return this.profileModel.findByIdAndRemove( email );
    }

    /**
     * Get Version comparison for docker artifacts of this profile. This one
     * is stateless and will return the matching versions
     * @param email email of the profiles user
     */
    async inquireVersions(email: string): Promise<IVersionManifest[]> {
        const profile: IUserProfile = await this.profileModel.findById( email );
        if (!profile)
            throw new HttpException('Profile not found', HttpStatus.NOT_FOUND);                    
        return this._inquireVersionsForChannel(profile, 'ws', false);
    }                        

    /**
     * Get Version comparison for docker artifacts of this profile. This one
     * is stateful and will return only the ones not sent before
     * @param email email of the profiles user
     */
    async inquireVersionNews(email: string, persist: boolean): Promise<IVersionManifest[]> {
        const profile: IUserProfile = await this.profileModel.findById( email );
        if (!profile)
            throw new HttpException('Profile not found', HttpStatus.NOT_FOUND);                    
            
        const versions = await this._inquireVersionsForChannel(profile, 'ws', true);
        // now create status objects and save them
        await Promise.all(versions.map((manifest) => {
            return Promise.all(manifest.tags.map((tag) => {
                const status = new NotificationStatus(profile.email, 'ws', manifest.subject, tag.tag);
                if (persist !== false) {
                    Logger.info(`Created notification status ${status._id}`);
                    return this.notifcationstatusModel.findByIdAndUpdate( status._id, status, { upsert: true, new: true, setDefaultsOnInsert: true});                                                                                    
                }
            }));
        }));
        return versions;
    }                        
    
    /* get the versions for a certain channel */
    async _inquireVersionsForChannel(profile: IUserProfile, channel: string, delta: boolean): Promise<IVersionManifest[]> {                                

        const versions: IVersionManifest[] = await this.versionService.fetchAndFilterMany(profile.subscribedVersions);
        return _.without(await Promise.all(versions.map(async (manifest: VersionManifest) => {

            // get request to read channels
            const requirement: UserVersionProfile = this._getSubscribedVersion(profile, manifest)
            let validNotificationChannels = requirement.notificationChannels;
            if (!validNotificationChannels || validNotificationChannels.length == 0) validNotificationChannels = profile.defaults.notificationChannels || [];
            // add the webservice channel in all cases - is used for the inquire via rest
            validNotificationChannels.push('ws');
            // if not matching the channel skip the whole image
            if (validNotificationChannels.indexOf(channel) == -1) {
                return null;
            }             
            // if in "delta mode" we just return the tags since the last call            
            manifest.tags = _.without(await Promise.all(manifest.tags.map((tag) => this._checkNotificationStatus(
                profile, // profile
                channel, 
                manifest.subject, 
                tag, // the whole tag object                
                delta,                
                requirement.filter
                ))), null);            

            return manifest;
        })), null);
    }

    _getSubscribedVersion(profile: IUserProfile, image: IVersionManifest): UserVersionProfile {
        return profile.subscribedVersions.find((img) => {
            return img.subject === image.subject           
        });
    }

    /**
     * Email notifications
     * @param profile 
     */
    async _handleMailNotification(profile: IUserProfile, persist: boolean) {
        // care about mail - send a summary if we have any news
        let versions = await this._inquireVersionsForChannel(profile, 'mail', true);
        versions = versions.filter((image) => image.tags.length > 0);
        if (versions.length > 0) {
            const mailOptions = new MailOptions();
            mailOptions.to = profile.email;
            mailOptions.subject = 'Your versionspout news';
            mailOptions.template = 'news'                            
            this.mailService.send(await this.mailService.compose(mailOptions, { profile, versions }, profile.htmlEmail));            
            // now create status objects and save them
            await Promise.all(versions.map((image) => {
                return Promise.all(image.tags.map((tag) => {
                    const status = new NotificationStatus(profile.email, 'mail', image.subject, tag.tag);                
                    if (persist !== false) {
                        Logger.debug(`Created notification status ${status._id}`);
                        return this.notifcationstatusModel.findByIdAndUpdate( status._id, status, { upsert: true, new: true, setDefaultsOnInsert: true});                                                                                    
                    }
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
    async _checkNotificationStatus(profile: IUserProfile, channel:string, image:string, tag: IVersionTag, forceState:boolean, filter: IVersionFilter) {                                        
        // ignore everything matching a regex in the ignorepatterns        
        if (filter && filter.semver && !tag.isSemver)
            return null;        
        if (forceState) {
            const status = new NotificationStatus(profile.email, channel, image, tag.tag);                
            const notificationStatus = await this.notifcationstatusModel.findById( status._id, status, { upsert: true, new: false, setDefaultsOnInsert: true })
            if (notificationStatus == null) // notificationstatus was newly created and therefor not existing
                return tag;
            else
                return null;
        }
        return tag;
    }

    /**
     * Additionan Notifications (webhook etc.)
     * @param profile 
     */
    async _handlAdditinalNotifications(profile: IUserProfile, persist: boolean) {
        // care about webhooks - call them fire and forget
        const versions = await Promise.all(profile.notificationChannels.map(async (channel) => {
            if (channel.type == 'mail') 
                return [];
            return await this._inquireVersionsForChannel(profile, channel.name, true);
        }));
        profile.notificationChannels.map(async (channel, index) => {                        
            if (channel.type == 'webhook') {                
                return Promise.all(versions[index].map((manifest) => {
                    return Promise.all(manifest.tags.map((tag) => {
                        channel.config.method = 'POST'
                        channel.config.data = {
                            manifest: {
                                subject: manifest.subject
                            },
                            tag: {
                                name: tag.tag,                                
                                published: tag.published,
                                data: tag.data
                            }
                        };
                        return this.httpService.axiosRef(channel.config)
                        .then(async () => {
                            Logger.info(`webhook ${channel.config.url} of channel ${channel.name} called because ${manifest.subject}:${tag.tag}`);
                            const status = new NotificationStatus(profile.email, channel.name, manifest.subject, tag.tag);                
                            if (persist !== false) {
                                Logger.debug(`Created notification status ${status._id}`);
                                await this.notifcationstatusModel.findByIdAndUpdate( status._id, status, { upsert: true, new: true, setDefaultsOnInsert: true});                                                                                    
                            }
                        })
                        .catch(async (e) => {
                            Logger.error(`problems calling webhook ${channel.config.url} of channel ${channel.name}, (called because ${manifest.subject}:${tag.tag}): ${e.message}`);                            
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
    async doNotifications(email: string, persist: boolean) {                        
        const profile: IUserProfile = await this.profileModel.findById( email );
        if (!profile)
            throw new HttpException('Profile not found', HttpStatus.NOT_FOUND);                    
        // mail notifications
        this._handleMailNotification(profile, persist);        
        // webhook notifications
        this._handlAdditinalNotifications(profile, persist);      
    }

    constructor(        
        @Inject('UserProfileToken') private readonly profileModel: Model<IUserProfile>,
        @Inject('NotificationStatusToken') private readonly notifcationstatusModel: Model<INotificationStatus>,
        private readonly versionService: VersionService,
        private readonly httpService: HttpService,
        private readonly mailService: MailService) {}

}
