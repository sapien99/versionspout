import {HttpService, HttpException, HttpStatus, Injectable, Logger} from '@nestjs/common';
import { DockerVersionModel } from './models/docker.model';
import { DockerVersionInterface } from './models/docker.interface';
import { Model } from 'mongoose';
import * as semver from 'semver';
import { InjectModel } from '@nestjs/mongoose';
import * as async from 'async';
import * as drc from 'docker-registry-client';
import { DockerCompareResultModel, DockerTagModel, DockerCompareRequestModel } from './models/docker-compare.model';
import { CompareServiceInterface } from './compare-service.interface';
import * as _ from 'lodash';

@Injectable()
export class DockerVersionService implements CompareServiceInterface {

    /**
     * Create Model from versions string rancher/rancher:1.0 -> DockerVersionModel
     * @param artifactString
     */
    createModelFromString(artifactString: string): DockerVersionModel {
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
        return new DockerVersionModel(repository, artifact, tag);
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
        return this.fetchVersions(meta, ['latest', 'master', 'develop'])
            .then((result) => {
                return new DockerCompareResultModel(meta.repository, meta.image, result.reverse().map(
                    (dockerVersion) => new DockerTagModel(dockerVersion.tag, null)));
            });
    }

    private createManifestWrapper(client, meta, tag) {
        return (cb) => {
            client.getManifest({ref: tag}, (errorManifest, manifestResult) => {
                if (errorManifest) {
                    Logger.error(errorManifest);
                    return cb(errorManifest, null);
                }
                const layer = JSON.parse(manifestResult.history[0].v1Compatibility);
                const retVal = new DockerVersionModel(meta.repository, meta.image, tag);
                retVal.created = layer.created;
                cb(null, retVal);
            });
        };
    }

    /**
     * Fetch values from versions hub to store it in cache
     * @param data
     */
    async fetchVersions( meta: DockerCompareRequestModel , ignoreSemverTagCheck: string[]): Promise<DockerVersionModel[]> {
        Logger.log(`Fetching repo: ${meta.repository}, ${meta.image}`);
        const client = drc.createClientV2({name: `${meta.repository}/${meta.image}`});

        return new Promise<DockerVersionModel[]>((resolve, reject) => {
            client.listTags((error, tagsResult) => {
                client.close();
                if (error) {
                    return reject(error);
                }

                Logger.log(`Found ${tagsResult.tags.length} tags for ${tagsResult.name}: ${JSON.stringify(tagsResult.tags)}`);
                const filtered = tagsResult.tags.filter((tag) => {
                    // if our current tag is latest we assume to be always on the last state
                    if (meta.tag === 'latest') {
                        // TODO: compare by hash ??
                        return true;
                    }
                    if (semver.valid(tag)) {
                        let keep = true;
                        if (meta.tag) {
                            keep = semver.gte(tag, meta.tag);
                            if (keep && meta.allowedRange)
                            keep = semver.satisfies(tag, meta.allowedRange);
                            Logger.log(`${meta.image} ${meta.tag} < ${tag} -> ${meta.allowedRange} -> ${keep}`);
                        }                        
                        return keep;
                    }
                    // if the tag is invalid semver but in the whitelist let it pass
                    return ignoreSemverTagCheck.indexOf(tag) > -1;
                });

                resolve(filtered.map((tag) => new DockerVersionModel(meta.repository, meta.image, tag)));
            });
        });
    }

    async fetchVersionsAndManifests( meta: DockerVersionModel ): Promise<DockerVersionModel[]> {
        Logger.log(`Fetching repo: ${meta.repository}, ${meta.image}`);
        const client = drc.createClientV2({name: `${meta.repository}/${meta.image}`});

        return new Promise<DockerVersionModel[]>((resolve, reject) => {
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

    // constructor(private readonly httpService: HttpService,
    //    @InjectModel('DockerVersion') private readonly dockerModel: Model<DockerVersionInterface>) {}

    constructor(private readonly httpService: HttpService) {}

}
