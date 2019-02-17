import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import * as semver from 'semver';
import { InjectModel } from '@nestjs/mongoose';
import * as async from 'async';
import * as drc from 'docker-registry-client';
import { IDockerImage, DockerImage, DockerTag, DockerVersionMatch } from './models/docker.model';
import * as _ from 'lodash';

export interface IDockerService {

    fetchAndCompare( data: DockerVersionMatch ): Promise<IDockerImage>;

}

@Injectable()
export class DockerService implements IDockerService {

    /**
     * Create Model from versions string rancher/rancher:1.0 -> DockerModel
     * @param artifactString
     */
    createModelFromString(artifactString: string): DockerVersionMatch {
        const REGEX = /([\w]+):([\w\d-.]+)/gm;
        let tag = 'latest';
        const vals = artifactString.split('/');
        let artifact = vals.pop();
        const repository = vals.join('/');
        const match = REGEX.exec(artifact);
        if (match) {
            artifact = match[1];
            tag = match[2];
        }
        Logger.log(`Extracted repository ${repository}, artifact ${artifact} and tag ${tag} from ${artifactString}`);
        return new DockerVersionMatch(repository, artifact, tag, null, '*');
    }

    /**
     * Fetch and compare multiple Tags and Versions
     * @param data
     */
    async fetchAndCompareMany( data: DockerVersionMatch[] ): Promise<DockerImage[]> {
        if (!_.isArray(data))
            throw new HttpException('Invalid input data', HttpStatus.BAD_REQUEST);
        return Promise.all(data.map((meta: DockerVersionMatch) => this.fetchAndCompare(meta)));
    }

    /**
     * Fetch and compare single Tag Versions
     * @param data
     */
    async fetchAndCompare( meta: DockerVersionMatch ): Promise<DockerImage> {
        if (!_.isObject(meta))
            throw new HttpException('Invalid input data', HttpStatus.BAD_REQUEST);
        return this.filterSemverVersions(meta);            
    }

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
    async fetchVersions( meta: DockerVersionMatch): Promise<DockerImage> {        
        const client = drc.createClientV2({name: `${meta.repository}/${meta.image}`});
        return new Promise<DockerImage>(async (resolve, reject) => {
            // if we have a valid cache entry serve from cache
            const _id = `${meta.repository}/${meta.image}`;
            const cachedEntry = await this.dockerVersionModel.findById(_id);
            var now = new Date();
            now.setDate(now.getDate()+1);            
            if (cachedEntry && 
                new Date(cachedEntry.fetched).getTime() < (new Date().getTime() + 1*24*60*60*1000)) {
                Logger.log(`Fetched repo: ${meta.repository}, ${meta.image} from cache`);
                return resolve(cachedEntry);                                
            }
            // else fetch from docker-repo
            Logger.log(`Fetching repo: ${meta.repository}, ${meta.image} from dockerhub`);
            client.listTags(async (error, tagsResult) => {
                client.close();
                if (error) {
                    return reject(error);
                }          
                                            
                // get manifest for each tag. Done as a separate step to preserve order
                let cacheEntry: DockerImage = new DockerImage(meta.repository, meta.image, []);                
                const tagMap = {};
                await Promise.all(tagsResult.tags.map(async (tag) => {
                    let manifest = await this.createManifestWrapper(client, tag);                    
                    tagMap[tag] = manifest;                    
                }));

                tagsResult.tags.reverse().forEach((tag) => {                    
                    cacheEntry.tags.push(new DockerTag(tag, tagMap[tag]));
                });
                
                // save data in cache
                const mongooseModel = new this.dockerVersionModel(cacheEntry);
                mongooseModel._id = _id;
                await mongooseModel.save({ upsert: true });          
                
                resolve(cacheEntry);
            });
        });
    }

    /**
     * Filter semver Versions from entried we read
     * @param data
     */
    async filterSemverVersions( meta: DockerVersionMatch): Promise<DockerImage> {        
        return new Promise<DockerImage>(async (resolve, reject) => {
            // fetch data
            const tagsResult: DockerImage = await this.fetchVersions(meta)
            Logger.log(`Found ${tagsResult.tags.length} tags for ${tagsResult.repository}/${tagsResult.image}`);
            // filter the tags we need
            const filtered = tagsResult.tags.filter((tagObj) => {                
                if (semver.valid(tagObj.tag)) {
                    let keep = true;
                    if (meta.tag) {
                        keep = semver.gte(tagObj.tag, meta.tag);
                        if (keep && meta.semverRange)
                        keep = semver.satisfies(tagObj.tag, meta.semverRange);
                        Logger.log(`${meta.image} ${meta.tag} < ${tagObj.tag} -> ${meta.semverRange} -> ${keep}`);
                    }     
                    tagObj.isSemver = true;                
                    return keep;
                }                
                tagObj.isSemver = false;                
                return true; 
            });
            tagsResult.tags = filtered;
            Logger.log(`Shrinked list down to ${JSON.stringify(tagsResult.tags.length)} for ${tagsResult.repository}/${tagsResult.image}: ${JSON.stringify(tagsResult.tags)}`);
            tagsResult.semverRange = meta.semverRange;
            resolve(tagsResult);
        });
    }

    constructor(
        @InjectModel('DockerVersion') private readonly dockerVersionModel: Model<IDockerImage>,
    ) {}

}
