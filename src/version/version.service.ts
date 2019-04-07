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
        let manifest: VersionManifest = null;
        try {
            manifest = await this.fetchVersions(profile)        
            if (!manifest.tags) {
                manifest.tags = [];
            }
            Logger.info(`Found ${manifest.tags.length} tags for ${manifest.subject}`);        
            // sort tags descending by published date
            manifest.tags = _.orderBy(manifest.tags, ['published'], ['desc'])
        } catch(e) {
            manifest = new VersionManifest(profile.type, profile.subject, []);
            Logger.warn(`Error fetching tags for ${manifest.subject}`);            
        }
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
                
                // drop
                if (_.some(profile.drop, (pattern) => tagObj.tag.match(new RegExp(pattern)))) {
                    Logger.debug(`DROP PATTERN CHECK: ${profile.subject}:${tagObj.tag} -> ${profile.drop} -> false`);                    
                    return false;                  
                }

                //keep
                if (profile.keep && profile.keep.length > 0 && !_.some(profile.keep, (pattern) => tagObj.tag.match(new RegExp(pattern)))) {
                    Logger.debug(`KEEP PATTERN CHECK: ${profile.subject}:${tagObj.tag} -> ${profile.keep} -> false`);                    
                    return false;                  
                }

                //extract
                if (profile.extract) {                    
                    const versionExtractionRegex = RegExp(profile.extract);                    
                    let m = versionExtractionRegex.exec(tagObj.tag);
                        if (m && m.length > 0) {
                            (<any>tagObj).tag = m[1];
                        }                        
                }

                //todo: replace

                //filter published                
                if (profile.filter.published) {                       
                    let lh = profile.filter.published[0]
                    let match = profile.filter.published;
                    if (['<','>'].indexOf(lh) > -1) {
                        match = profile.filter.published.substring(1,profile.filter.published.length);
                    }                   
                    let keep = true;      
                    const dateFrom = new Date(match);
                    dateFrom.setHours(0,0,0,0)
                    const dateTag = tagObj.published;
                    dateTag.setHours(0,0,0,0)
                    if (lh === '>') {
                        keep = dateTag > dateFrom;
                    } else {
                        keep = dateTag < dateFrom;
                    }                  
                    Logger.debug(`PUBLISHED CHECK: ${profile.subject}: tag=${dateTag} ${lh} filter=${dateFrom} -> ${keep}`);                                        
                    if (!keep) 
                        return false;
                }                

                //filter semver                
                if (semver.valid(tagObj.tag)) {
                    tagObj.isSemver = true;                
                    if (profile.filter.semver) {                        
                        let keep = true;
                        keep = semver.satisfies(tagObj.tag, profile.filter.semver);                    
                        Logger.debug(`SEMVER CHECK: ${profile.subject}: tag=${tagObj.tag} -> filter=${profile.filter} -> ${keep}`);                                        
                        return keep;                            
                    }
                    tagObj.isSemver = false;                    
                }
                return true; 
            });
            manifest.tags = filtered;
            Logger.debug(`Shrinked list down to ${JSON.stringify(manifest.tags.length)} for ${manifest.subject}`);
            if (profile)
                manifest.filter = profile.filter;
            resolve(manifest);
        });
    }

    constructor(                
        private readonly dockerVersionService: DockerService,
        private readonly githubReleaseService: GithubService,
    ) {}

}
