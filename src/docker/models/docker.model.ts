import { IVersionManifest, VersionManifest, IVersionTag, VersionTag, IVersionProfile, VersionProfile } from './../../version/models/version.model';

export class DockerTag extends VersionTag implements IVersionTag {

    constructor(tag: string, manifest: any) {
        super('docker', tag, manifest);        
        this.data = [];

        if (manifest) {            
            this.created = manifest.created ? new Date(manifest.created) : null;    
            this.data = {
                actual: {
                    created: manifest.created ? new Date(manifest.created) : null,   
                    hash: manifest.hashes[0]
                }
            };
        }        
    }
}

export class DockerManifest extends VersionManifest implements IVersionManifest {

    constructor(subject: string, tags: DockerTag[]) {
        super('docker', subject, tags);        
    }

}

/**
 * A docker "profile" matching on image, repository and several tags
 */
export class DockerVersionProfile extends VersionProfile implements IVersionProfile {
    
    constructor(subject: string, semver: string | null, ignorePatterns: string[]) {                        
        super('docker', subject, semver, ignorePatterns );        
    }

}
