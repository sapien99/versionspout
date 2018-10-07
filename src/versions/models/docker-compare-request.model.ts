import { CompareServiceInterface } from '../compare-service.interface';
import {DockerCompareResultModel} from './docker-compare-result.model';
import {CompareRequestModel} from './compare-request.model';
import {Logger} from '@nestjs/common';

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
    static createFromCompareRequestModel(request: CompareRequestModel): DockerCompareRequestModel {
        const REGEX = /([\w]+):([\w\d-.]+)/gm;
        let tag = 'latest';
        const vals = request.artifact.split('/');
        let artifact = vals.pop();
        const repository = vals.join('/');
        const match = REGEX.exec(artifact);
        if (match) {
            artifact = match[1];
            tag = match[2];
        }
        Logger.log(`Extracted repository ${repository}, artifact ${artifact} and tag ${tag} from ${request.artifact}`);
        return new DockerCompareRequestModel(repository, artifact, tag, null, request.allowedRange);
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
