import { Test, TestingModule } from '@nestjs/testing';
import { DockerVersionController } from './docker-version.controller';
import { DockerVersionService } from './docker-version.service';
import { DockerCompareRequestModel } from './models/docker-compare-request.model';
import { DockerCompareResultModel } from './models/docker-compare-result.model';

describe('AppController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [DockerVersionController],
      providers: [DockerVersionService],
    }).compile();
    console.log('APP', app);
  });

  describe('DockerCompareRequestModel shall transform String into DockerCompareRequestModel', () => {
    it('should return right images and repository', () => {
      const model: DockerCompareRequestModel = DockerCompareRequestModel.createFromString('prom/prometheus:v2.2.0', null)
      expect(model instanceof DockerCompareRequestModel);      
      expect(model.image == 'prometheus');
      expect(model.repository == 'prom');
    });

    it('should return * for allowedRange if null is given as parameter', () => {
      const model: DockerCompareRequestModel = DockerCompareRequestModel.createFromString('prom/prometheus:v2.2.0', null)
      expect(model instanceof DockerCompareRequestModel);
      expect(model.allowedRange === '*');      
    });

    it('should return correct string for allowedRange if null is given as parameter', () => {
      const model: DockerCompareRequestModel = DockerCompareRequestModel.createFromString('prom/prometheus:v2.2.0', '>2.2.0')
      expect(model instanceof DockerCompareRequestModel);
      expect(model.allowedRange === '>2.2.20');      
    });

  });
  
});
