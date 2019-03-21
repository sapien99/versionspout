import { HttpException, HttpStatus, Injectable, Inject, HttpService } from '@nestjs/common';
import { Model } from 'mongoose';
import { GithubRelease, GithubRepository, GithubVersionProfile } from './models/github.model';
import { IVersionProvider } from '../version/version.service';
import * as _ from 'lodash';
import { Logger } from '../logger';
import * as axios from 'axios-https-proxy-fix';

@Injectable()
export class GithubService implements IVersionProvider {

    async listReleases(profile: GithubVersionProfile): Promise<any> {
        try {            

            const httpConfig: any = {
                method: 'get',
                url: `https://api.github.com/repos/${profile.subject}/releases`,
                headers: {                    
                    'accept': 'application/json'
                }
            }

            let proxy = process.env.https_proxy || process.env.HTTPS_PROXY;
            if (proxy) {
                Logger.info(`Using proxy ${proxy}`)
                const proxyRegex = /https*:\/\/((\w+):(\w+)@)*(.*):(\d+)/gm;
                // 2: user
                // 3: password
                // 4: host 
                // 5: port                
                const m = proxyRegex.exec(proxy);
                if (m !== null) {                    
                    if (m.length > 3) {                        
                        httpConfig.proxy = {
                            host: m[4], 
                            port: m[5]                    
                        }
                        if (m[2] && m[3]) {
                            httpConfig.proxy.auth = {
                                username: m[2],
                                password: m[3]
                            }
                        }
                    }                    
                }                
            }

            const resp:any = await axios.default(httpConfig);                      
            return resp.data;                            
        } catch (e) {
            Logger.error(`Fetching github repos failed ${e}`);
            return [];
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
            
            resolve(_.orderBy(cacheEntry, ['published'], ['desc']));            
        });
    }

    constructor(
        private readonly httpService: HttpService,
        @Inject('GithubRepositoryToken') private readonly githubVersionModel: Model<GithubRepository>        
    ) {}

}
