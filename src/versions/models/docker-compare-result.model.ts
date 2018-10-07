import { DockerTagModel } from './docker-tag.model';

export class DockerCompareResultModel {

    public readonly repository: string;
    public readonly image: string;
    public tags: DockerTagModel[];

    constructor(repository: string, image: string, tags: DockerTagModel[]) {
        this.repository = repository;
        this.image = image;
        this.tags = tags;
    }

}
