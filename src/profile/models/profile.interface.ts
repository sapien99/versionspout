import { DockerCompareRequestModel } from '../../docker/models/docker.model';
import { Document } from 'mongoose';


export interface ProfileInterface extends Document {

    readonly email: string;
    readonly dockerVersions: DockerCompareRequestModel[];    

}
