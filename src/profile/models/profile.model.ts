import { ProfileInterface } from './profile.interface';
import { DockerCompareRequestModel } from 'docker/models/docker.model';
import { IsNotEmpty, IsEmail } from 'class-validator';

export class ProfileModel implements ProfileInterface {

    @IsNotEmpty()
    @IsEmail()
    public readonly email: string;
    @IsNotEmpty()
    public readonly dockerVersions: DockerCompareRequestModel[];    

    constructor(email: string, dockerVersions: DockerCompareRequestModel[]) {
        this.email = email;
        this.dockerVersions = dockerVersions;    
    }

}
