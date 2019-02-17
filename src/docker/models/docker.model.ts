import { IDockerService } from './../docker.service';
import { Logger } from '@nestjs/common';

export interface IDockerTag {
    readonly tag: string;
    isSemver: boolean;
    readonly created: Date | null;        
    readonly hashes: string[] | null;    
}

export interface IDockerImage {
    readonly repository: string;
    readonly image: string;    
    readonly fetched: Date;
    readonly tags: IDockerTag[];
    readonly semverRange: string;
}

export class DockerTag implements IDockerTag {

    public tag: string;
    public created: Date | null;
    public isSemver: boolean;
    public hashes: string[];    

    constructor(tag: string, manifest: any) {
        this.tag = tag;
        this.created = null;
        this.hashes = [];

        if (manifest) {
            this.created = manifest.created ? new Date(manifest.created) : null;    
            this.hashes = [manifest.hashes[0]]; // just for now
        }        
    }
}

export class DockerImage implements IDockerImage {

    public readonly repository: string;
    public readonly image: string;    
    public readonly fetched: Date;
    public tags: IDockerTag[];
    public semverRange: string;

    constructor(repository: string, image: string, tags: DockerTag[]) {
        this.repository = repository;
        this.image = image;
        this.tags = tags;
    }

}

/**
 * A docker "profile" matching on image, repository and several tags
 */
export class DockerVersionMatch {

    public readonly repository: string;
    public readonly image: string;
    public tag: string;
    public hash: string | null;
    public semverRange: string | null;
    public ignoreTagsNotSemver: boolean;

    public static service: IDockerService;

    /**
     * Create Model from versions string rancher/rancher:1.0 -> DockerModel
     * @param artifactString
     */
    static createFromString(artifact: string, semverRange: string | null): DockerVersionMatch {
        const REGEX = /([\w]+):([\w\d-.]+)/gm;
        let tag = 'latest';
        const vals = artifact.split('/');
        let image = vals.pop();
        const repository = vals.join('/');
        const match = REGEX.exec(image);
        if (match) {
            artifact = match[1];
            tag = match[2];
        }
        Logger.log(`Extracted repository ${repository}, artifact ${artifact} and tag ${tag} from ${artifact}`);
        return new DockerVersionMatch(repository, artifact, tag, null, semverRange || '*');
    }

    public async fetchAndCompare(): Promise<DockerImage> {
        return DockerVersionMatch.service.fetchAndCompare(this);
    }

    constructor(repository: string, image: string, tag: string, hash: string | null, semverRange: string | null) {
        this.repository = repository;
        this.image = image;
        this.tag = tag;
        this.semverRange = semverRange;
        this.ignoreTagsNotSemver = false;
    }

}
