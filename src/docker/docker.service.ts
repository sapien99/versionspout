import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { DockerVersionInterface } from './models/docker.interface';
import { Model } from 'mongoose';
import * as semver from 'semver';
import { InjectModel } from '@nestjs/mongoose';
import * as async from 'async';
import * as drc from 'docker-registry-client';
import { DockerCompareResultModel, DockerCompareTagModel, DockerCompareRequestModel } from './models/docker.model';
import { CompareServiceInterface } from './compare.interface';
import * as _ from 'lodash';

@Injectable()
export class DockerVersionService implements CompareServiceInterface {

    /**
     * Create Model from versions string rancher/rancher:1.0 -> DockerModel
     * @param artifactString
     */
    createModelFromString(artifactString: string): DockerCompareRequestModel {
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
        return new DockerCompareRequestModel(repository, artifact, tag, null, '*');
    }

    /**
     * Fetch and compare multiple Tags and Versions
     * @param data
     */
    async fetchAndCompareMany( data: DockerCompareRequestModel[] ): Promise<DockerCompareResultModel[]> {
        if (!_.isArray(data))
            throw new HttpException('Invalid input data', HttpStatus.BAD_REQUEST);
        return Promise.all(data.map((meta: DockerCompareRequestModel) => this.fetchAndCompare(meta)));
    }

    /**
     * Fetch and compare single Tag Versions
     * @param data
     */
    async fetchAndCompare( meta: DockerCompareRequestModel ): Promise<DockerCompareResultModel> {
        if (!_.isObject(meta))
            throw new HttpException('Invalid input data', HttpStatus.BAD_REQUEST);
        return this.filterSemverVersions(meta, ['latest', 'master', 'develop']);
            /*.then((result) => {
                // TODO: guess we can skip this
                // reorder the tags
                return new DockerCompareResultModel(meta.repository, meta.image, result.tags.reverse().map(
                    (dockerVersion) => new DockerCompareTagModel(dockerVersion.tag, null)));
            });*/
    }

    private createManifestWrapper(client, meta, tag) {
        // TODO: do we need this?
        return (cb) => {
            client.getManifest({ref: tag}, (errorManifest, manifestResult) => {
                if (errorManifest) {
                    Logger.error(errorManifest);
                    return cb(errorManifest, null);
                }
                const layer = JSON.parse(manifestResult.history[0].v1Compatibility);
                const retVal = new DockerCompareRequestModel(meta.repository, meta.image, tag, null, null);
                // retVal.created = layer.created;
                cb(null, retVal);
            });
        };
    }
    
    async fetchVersions( meta: DockerCompareRequestModel): Promise<DockerCompareResultModel> {        
        const client = drc.createClientV2({name: `${meta.repository}/${meta.image}`});
        return new Promise<DockerCompareResultModel>(async (resolve, reject) => {
            // if we have a valid cache entry serve from cache
            const _id = `${meta.repository}/${meta.image}`;
            const cachedEntry = await this.dockerVersionModel.findById(_id)
            if (cachedEntry) {
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
                                            
                // save data in cache
                let cacheEntry: DockerCompareResultModel = new DockerCompareResultModel(meta.repository, meta.image, []);                
                tagsResult.tags.reverse().forEach(async (tag) => {                                                            
                    cacheEntry.tags.push(new DockerCompareTagModel(tag, null));
                })
                const mongooseModel = new this.dockerVersionModel(cacheEntry);
                mongooseModel._id = _id;
                await mongooseModel.save({ upsert: true });          
                
                resolve(cacheEntry);
            });
        });
    }

    /**
     * Filter semver Versions
     * @param data
     */
    async filterSemverVersions( meta: DockerCompareRequestModel , ignoreSemverTagCheck: string[]): Promise<DockerCompareResultModel> {        
        return new Promise<DockerCompareResultModel>(async (resolve, reject) => {
            // fetch data
            const tagsResult: DockerCompareResultModel = await this.fetchVersions(meta)
            Logger.log(`Found ${tagsResult.tags.length} tags for ${tagsResult.repository}/${tagsResult.image}`);
            // filter the tags we need
            const filtered = tagsResult.tags.filter((tagObj) => {
                // if our current tag is latest we assume to be always on the last state
                if (tagObj.tag === 'latest') {
                    // TODO: compare by hash ??
                    return true;
                }
                if (semver.valid(tagObj.tag)) {
                    let keep = true;
                    if (meta.tag) {
                        keep = semver.gte(tagObj.tag, meta.tag);
                        if (keep && meta.allowedRange)
                        keep = semver.satisfies(tagObj.tag, meta.allowedRange);
                        Logger.log(`${meta.image} ${meta.tag} < ${tagObj.tag} -> ${meta.allowedRange} -> ${keep}`);
                    }                        
                    return keep;
                }
                // if the tag is invalid semver but in the whitelist let it pass
                return ignoreSemverTagCheck.indexOf(tagObj.tag) > -1;
            });
            tagsResult.tags = filtered;
            Logger.log(`Shrinked list down to ${JSON.stringify(tagsResult.tags.length)} for ${tagsResult.repository}/${tagsResult.image}: ${JSON.stringify(tagsResult.tags)}`);
            resolve(tagsResult);
        });
    }

    async fetchVersionsAndManifests( meta: DockerCompareRequestModel ): Promise<DockerCompareRequestModel[]> {
        Logger.log(`Fetching repo: ${meta.repository}, ${meta.image}`);
        const client = drc.createClientV2({name: `${meta.repository}/${meta.image}`});

        return new Promise<DockerCompareRequestModel[]>((resolve, reject) => {
            const ignoreTags = ['latest', 'master'];
            client.listTags((error, tagsResult) => {
                if (error) {
                    client.close();
                    reject(error);
                }
                Logger.log(`Found ${tagsResult.tags.length} tags for ${tagsResult.name}: ${JSON.stringify(tagsResult.tags)}`);

                if (tagsResult.tags.indexOf(meta.tag) === -1) {
                    return reject('Current tag not found');
                }
                async.parallel(tagsResult.tags.map((tag) => this.createManifestWrapper(client, meta, tag)), (err, results) => {
                    resolve(results);
                });
            });
        });
    }

    constructor(
        @InjectModel('DockerVersion') private readonly dockerVersionModel: Model<DockerVersionInterface>,
    ) {}

}
