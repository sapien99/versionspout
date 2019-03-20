import { HttpException, HttpStatus, Injectable, Inject, HttpService } from '@nestjs/common';
import { Model } from 'mongoose';
import { GithubRelease, GithubRepository, GithubVersionProfile } from './models/github.model';
import { IVersionProvider } from '../version/version.service';
import * as _ from 'lodash';
import { Logger } from '../logger';

@Injectable()
export class GithubService implements IVersionProvider {

    async listReleases(profile: GithubVersionProfile): Promise<any> {
        try {            
            const resp:any = await this.httpService.axiosRef({
                method: 'get',
                url: `https://api.github.com/repos/${profile.subject}/releases`,
                headers: {                    
                    'accept': 'application/json'
                }                    
              });                      
            return resp.data;                            
        } catch (e) {
            Logger.error('Creating ovirt-engine authentication token failed', e);
            return null;
        }
    }
    /**
     * Fetch Version, either from cache or from repo
     * @param meta 
     */
    async fetchVersions( profile: GithubVersionProfile): Promise<GithubRepository> {        
        
        return new Promise<GithubRepository>(async (resolve, reject) => {
            // if we have a valid cache entry serve from cache
            const _id = profile.subject;
            const cachedEntry = await this.githubVersionModel.findById(_id);
            var now = new Date();
            now.setDate(now.getDate()+1);            
            if (cachedEntry && 
                new Date(cachedEntry.fetched).getTime() < (new Date().getTime() + 1*24*60*60*1000)) {
                Logger.debug(`Fetched repo: ${profile.subject} from cache`);
                return resolve(cachedEntry);                                
            }
            // else fetch from docker-repo
            Logger.debug(`Fetching repo: ${profile.subject} from github`);
            
            const releases = await this.listReleases(profile);
            if (!releases) {
                return reject(`Error fetching releases for ${profile.subject}`);
            }                                                                                          

            let cacheEntry: GithubRepository = new GithubRepository(profile.subject, []);                
            releases.forEach((release) => {                    
                cacheEntry.tags.push(new GithubRelease(release.tag_name, release));
            });
            
            // save data in cache
            const mongooseModel = new this.githubVersionModel(cacheEntry);
            mongooseModel._id = _id;
            await mongooseModel.save({ upsert: true });          
            
            resolve(cacheEntry);            
        });
    }

    constructor(
        private readonly httpService: HttpService,
        @Inject('GithubRepositoryToken') private readonly githubVersionModel: Model<GithubRepository>        
    ) {}

}
