import { DockerVersionRequestModel } from './docker-version-request.model';
import { CompareServiceInterface } from '../compare-service.interface';

export interface DockerVersionRequestInterface {
    
    readonly allowedRange: string | null;
    readonly currentVersion: string | null;
    readonly artifact: string;

}
