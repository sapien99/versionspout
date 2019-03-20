import { IVersionManifest, VersionManifest, IVersionTag, VersionTag, IVersionProfile, VersionProfile } from '../../version/models/version.model';

export class GithubRelease extends VersionTag implements IVersionTag {

    constructor(tag: string, manifest: any) {
        super('github', tag);
        this.published = manifest.published_at;        
        this.data = {
            url: manifest.html_url
        }        
    }
}

export class GithubRepository extends VersionManifest implements IVersionManifest {

    constructor(subject: string, tags: GithubRelease[]) {
        super('github', subject, tags);        
    }

}

/**
 * A docker "profile" matching on image, repository and several tags
 */
export class GithubVersionProfile extends VersionProfile implements IVersionProfile {
    
    constructor(subject: string, semver: string | null, ignorePatterns: string[]) {                        
        super('github', subject, semver, ignorePatterns );        
    }

}
