import { Document } from 'mongoose';
import { DockerCompareRequestModel } from 'docker/models/docker-compare-request.model';

export interface ProfileInterface extends Document {

    readonly email: string;
    readonly dockerVersions: DockerCompareRequestModel[];    

}
