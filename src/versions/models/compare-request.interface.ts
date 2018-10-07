import {CompareRequestModel} from './compare-request.model';
import {CompareServiceInterface} from '../compare-service.interface';

export interface CompareRequestInterface {

    readonly type: string;
    readonly allowedRange: string | null;
    readonly currentVersion: string | null;
    readonly artifact: string;

    createFromCompareRequestModel(request: CompareRequestModel, service: CompareServiceInterface): any;

}
