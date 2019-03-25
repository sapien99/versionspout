import { HttpException, HttpStatus, Injectable, Inject, HttpService } from '@nestjs/common';
import { Model } from 'mongoose';
import { GithubRelease, GithubRepository, GithubVersionProfile } from './models/github.model';
import { IVersionProvider } from '../version/version.service';
import * as _ from 'lodash';
import { Logger } from '../logger';
import { globals } from '../env';
import * as request from 'request-promise-native';

@Injectable()
export class GithubService implements IVersionProvider {

    async listReleases(profile: GithubVersionProfile): Promise<any> {
        try {            

            const httpConfig: any = {
                method: 'get',
                url: `https://api.github.com/repos/${profile.subject}/releases`,
                headers: {                    
                    'accept': 'application/json',
                    'User-Agent': `versionspout:${globals.app.version}`
                },
                json: true
            }

            const resp:any = await request(httpConfig);                      
            return resp;                            
        } catch (e) {
            Logger.error(`Fetching github repos failed ${e}`);
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
            if (cachedEntry) {
                Logger.debug(`Fetched repo: ${profile.subject} from cache`);
                return resolve(cachedEntry);                                
            }
            // else fetch from docker-repo
            Logger.debug(`Fetching repo: ${profile.subject} from github`);
                        
            const releases = await this.listReleases(profile);
            if (!releases) {
                return reject(`Error fetching releases for ${profile.subject}`);
            }                                                                                          
            if (releases.length == 0) {
                Logger.warn(`Error fetching releases for ${profile.subject} returned empty`);
            }                                                                                          

            let cacheEntry: GithubRepository = new GithubRepository(profile.subject, []);                
            releases.forEach((release) => {                    
                cacheEntry.tags.push(new GithubRelease(release.tag_name, release));
            });
            // order by publish date desb
            cacheEntry.tags = _.orderBy(cacheEntry.tags, ['published'], ['desc']);
            
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
