import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as semver from 'semver';
import { VersionProfile, IVersionManifest, VersionManifest, IVersionTag, VersionTag } from './models/version.model';
import { DockerService } from '../docker/docker.service'; 
import { GithubService } from '../github/github.service'; 
import * as _ from 'lodash';
import { Logger } from '../logger';

export interface IVersionService {
    /**
     * Fetch Tags on base of the given profile
     * @param profile
     */
    fetchAndFilter( profile: VersionProfile ): Promise<IVersionManifest>;
    /**
     * Fetch Tags on base of the given profiles
     * @param profiles
     */
    fetchAndFilterMany( profiles: VersionProfile[] ): Promise<IVersionManifest[]>;

}

export interface IVersionProvider {
    fetchVersions( profile: VersionProfile): Promise<IVersionManifest>;
}

@Injectable()
export class VersionService implements IVersionService {

    /**
     * Fetch and compare multiple Tags and Versions
     * @param data
     */
    async fetchAndFilterMany( profiles: VersionProfile[] ): Promise<IVersionManifest[]> {
        if (!_.isArray(profiles))
            throw new HttpException('Invalid input data', HttpStatus.BAD_REQUEST);
        return Promise.all(profiles.map((meta: VersionProfile) => this.fetchAndFilter(meta)));
    }

    /**
     * Fetch and compare single Tag Versions
     * @param data
     */
    async fetchAndFilter( profile: VersionProfile ): Promise<IVersionManifest> {        
        if (!_.isObject(profile))
            throw new HttpException('Invalid input data', HttpStatus.BAD_REQUEST);        
        const manifest: VersionManifest = await this.fetchVersions(profile)
        Logger.info(`Found ${manifest.tags.length} tags for ${manifest.subject}`);
        return this.filterSemverVersions(manifest, profile);            
    }

    /**
     * Fetch Version, either from cache or from repo
     * @param meta 
     */
    async fetchVersions( profile: VersionProfile): Promise<IVersionManifest> {                
        switch (profile.type) {
            case 'docker': {                                
                return this.dockerVersionService.fetchVersions(profile);
            }
            case 'github': {                                
                return this.githubReleaseService.fetchVersions(profile);
            }                
            default: return null
        }        
    }

    /**
     * Filter semver Versions from entried we read
     * @param data
     */
    async filterSemverVersions( manifest: VersionManifest, profile: VersionProfile | null): Promise<IVersionManifest> {        
        return new Promise<VersionManifest>(async (resolve, reject) => {
            // filter the tags we need
            const filtered = manifest.tags.filter((tagObj) => {      
                if (_.some(profile.ignorePatterns, (pattern) => tagObj.tag.match(new RegExp(pattern)))) {
                    Logger.debug(`PATTERN CHECK: ${profile.subject}:${tagObj.tag} -> ${profile.ignorePatterns} -> false`);                    
                    return false;                  
                }
                if (semver.valid(tagObj.tag)) {
                    let keep = true;
                    keep = semver.satisfies(tagObj.tag, profile.semver);                    
                    Logger.debug(`SEMVER CHECK: ${profile.subject}:${tagObj.tag} -> ${profile.semver} -> ${keep}`);                    
                    tagObj.isSemver = true;                
                    return keep;
                }                
                tagObj.isSemver = false;                
                return true; 
            });
            manifest.tags = filtered;
            Logger.debug(`Shrinked list down to ${JSON.stringify(manifest.tags.length)} for ${manifest.subject}: ${JSON.stringify(manifest.tags)}`);
            if (profile)
                manifest.semver = profile.semver;
            resolve(manifest);
        });
    }

    constructor(                
        private readonly dockerVersionService: DockerService,
        private readonly githubReleaseService: GithubService,
    ) {}

}
