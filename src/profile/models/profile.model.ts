import { ProfileInterface } from './profile.interface';
import { DockerCompareRequestModel } from 'docker/models/docker-compare-request.model';

export class ProfileModel implements ProfileInterface {

    public readonly email: string;
    public readonly dockerVersions: DockerCompareRequestModel[];    

    constructor(email: string, dockerVersions: DockerCompareRequestModel[]) {
        this.email = email;
        this.dockerVersions = dockerVersions;    
    }

}
