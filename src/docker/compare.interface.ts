import {DockerCompareRequestModel, DockerCompareResultModel} from './models/docker.model';

export interface CompareServiceInterface {

    fetchAndCompare( data: DockerCompareRequestModel ): Promise<DockerCompareResultModel>;

}
