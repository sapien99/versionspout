import { CompareServiceInterface } from '../compare.interface';
import { Logger } from '@nestjs/common';
import { DockerVersionInterface, DockerVersionTagInterface } from './docker.interface';

export class DockerCompareRequestModel {

    public readonly repository: string;
    public readonly image: string;
    public tag: string;
    public hash: string | null;
    public allowedRange: string | null;

    public static service: CompareServiceInterface;

    /**
     * Create Model from versions string rancher/rancher:1.0 -> DockerModel
     * @param artifactString
     */
    static createFromString(artifact: string, allowedRange: string | null): DockerCompareRequestModel {
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
        return new DockerCompareRequestModel(repository, artifact, tag, null, allowedRange || '*');
    }

    public async fetchAndCompare(): Promise<DockerCompareResultModel> {
        return DockerCompareRequestModel.service.fetchAndCompare(this);
    }

    constructor(repository: string, image: string, tag: string, hash: string | null, allowedRange: string | null) {
        this.repository = repository;
        this.image = image;
        this.tag = tag;
        this.allowedRange = allowedRange;
    }

}

export class DockerCompareTagModel implements DockerVersionTagInterface {

    public tag: string;
    public created: Date | null;
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

export class DockerCompareResultModel implements DockerVersionInterface {

    public readonly repository: string;
    public readonly image: string;    
    public readonly fetched: Date;
    public tags: DockerCompareTagModel[];
    public allowedRange: string;

    constructor(repository: string, image: string, tags: DockerCompareTagModel[]) {
        this.repository = repository;
        this.image = image;
        this.tags = tags;
    }

}
