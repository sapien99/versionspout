import {DockerCompareRequestModel} from './models/docker-compare.model';
import {DockerCompareResultModel} from './models/docker-compare.model';

export interface CompareServiceInterface {

    fetchAndCompare( data: DockerCompareRequestModel ): Promise<DockerCompareResultModel>;

}
