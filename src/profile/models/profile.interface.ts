import { Document } from 'mongoose';
import { DockerVersionRequestInterface } from 'docker/models/docker-version-request.interface';

export interface ProfileInterface extends Document {

    readonly email: string;
    readonly dockerVersions: DockerVersionRequestInterface[];    

}
