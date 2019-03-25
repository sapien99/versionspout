import { HttpException, HttpStatus, Injectable, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import * as drc from 'docker-registry-client';
import { DockerManifest, DockerTag, DockerVersionProfile } from './models/docker.model';
import { IVersionProvider } from '../version/version.service';
import * as _ from 'lodash';
import { Logger } from '../logger';

@Injectable()
export class DockerService implements IVersionProvider {

    /**
     * Fetch metainfo for tag (latest hash-id, created-timestamp etc.)
     * @param client 
     * @param tag 
     */
    private createManifestWrapper(client, tag): Promise<any> {        
        return new Promise<any>(async (resolve, reject) => {        
            client.getManifest({ref: tag}, (errorManifest, manifestResult) => {
                if (errorManifest) {
                    Logger.error(errorManifest);
                    return reject(errorManifest);
                }
                const layer = JSON.parse(manifestResult.history[0].v1Compatibility);
                layer.hashes = manifestResult.history.map((l) => {
                    const meta = JSON.parse(l.v1Compatibility);
                    return meta.id;
                });
                resolve(layer);
            });
        });
    }
    
    /**
     * Fetch Version, either from cache or from repo
     * @param meta 
     */
    async fetchVersions( profile: DockerVersionProfile): Promise<DockerManifest> {        
        const client = drc.createClientV2({name: profile.subject});
        return new Promise<DockerManifest>(async (resolve, reject) => {
            // if we have a valid cache entry serve from cache
            const _id = profile.subject;
            const cachedEntry = await this.dockerVersionModel.findById(_id);
            var now = new Date();
            now.setDate(now.getDate()+1);            
            if (cachedEntry) {
                Logger.debug(`Fetched repo: ${profile.subject} from cache`);
                return resolve(cachedEntry);                                
            }
            // else fetch from docker-repo
            Logger.debug(`Fetching repo: ${profile.subject} from dockerhub`);
            client.listTags(async (error, tagsResult) => {
                client.close();
                if (error) {
                    return reject(error);
                }          
                                            
                // get manifest for each tag for getting layer and creation timestamp. Done as a separate step to preserve order                                
                const tagMap = {};
                await Promise.all(tagsResult.tags.map(async (tag) => {
                    let manifest = await this.createManifestWrapper(client, tag);                    
                    tagMap[tag] = manifest;                    
                }));

                let cacheEntry: DockerManifest = new DockerManifest(profile.subject, []);                
                tagsResult.tags.forEach((tag) => {                    
                    cacheEntry.tags.push(new DockerTag(tag, tagMap[tag]));
                });            
                // order by publish date desb
                cacheEntry.tags = _.orderBy(cacheEntry.tags, ['published'], ['desc']);    
                
                // save data in cache                
                const mongooseModel = new this.dockerVersionModel(cacheEntry);
                mongooseModel._id = _id;
                await mongooseModel.save({ upsert: true });          
                
                resolve(cacheEntry);
            });
        });
    }

    constructor(
        @Inject('DockerManifestToken') private readonly dockerVersionModel: Model<DockerManifest>        
    ) {}

}
