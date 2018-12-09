import {DockerCompareRequestModel} from './models/docker-compare-request.model';
import {DockerCompareResultModel} from './models/docker-compare-result.model';

export interface CompareServiceInterface {

    fetchAndCompare( data: DockerCompareRequestModel ): Promise<DockerCompareResultModel>;

}
