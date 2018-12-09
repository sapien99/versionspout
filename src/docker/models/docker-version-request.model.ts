import { DockerVersionRequestInterface } from './docker-version-request.interface'

export class DockerVersionRequestModel implements DockerVersionRequestInterface {

    public readonly repository: string;
    public readonly image: string;
    public tag: string;

    public readonly allowedRange: string;
    public readonly currentVersion: string;
    public readonly artifact: string;

    constructor(artifact: string, currentVersion: string | null, allowedRange: string | null) {        
        this.artifact = artifact;
        this.currentVersion = currentVersion;
        this.allowedRange = allowedRange;
    }

}
