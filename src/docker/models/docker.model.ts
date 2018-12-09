import {DockerVersionInterface} from './docker.interface';

export class DockerVersionModel implements DockerVersionInterface {

    public readonly repository: string;
    public readonly image: string;
    public tag: string;
    public created: Date | null;
    public fetched: Date | null;
    public hash: string;
    public size: number;

    constructor(repository: string, image: string, tag: string) {
        this.repository = repository;
        this.image = image;
        this.tag = tag;
    }

}
