import { ProfileInterface } from './profile.interface';
import { DockerVersionRequestInterface } from 'docker/models/docker-version-request.interface';

export class ProfileModel implements ProfileInterface {

    public readonly email: string;
    public readonly dockerVersions: DockerVersionRequestInterface[];    

    constructor(email: string, dockerVersions: DockerVersionRequestInterface[]) {
        this.email = email;
        this.dockerVersions = dockerVersions;    
    }

}
