import { Test, TestingModule } from '@nestjs/testing';
import { DockerVersionMatch } from './models/docker.model';

describe('AppController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    /*app = await Test.createTestingModule({
      controllers: [DockerVersionController],
      providers: [DockerVersionService],
    }).compile();
    console.log('APP', app); */
  });

  describe('DockerVersionMatch shall transform String into DockerVersionMatch', () => {
    it('should return right images and repository', () => {
      const model: DockerVersionMatch = DockerVersionMatch.createFromString('prom/prometheus:v2.2.0', null)
      expect(model instanceof DockerVersionMatch);      
      expect(model.image == 'prometheus');
      expect(model.repository == 'prom');
    });

    it('should return * for semverRange if null is given as parameter', () => {
      const model: DockerVersionMatch = DockerVersionMatch.createFromString('prom/prometheus:v2.2.0', null)
      expect(model instanceof DockerVersionMatch);
      expect(model.semverRange === '*');      
    });

    it('should return correct string for semverRange if null is given as parameter', () => {
      const model: DockerVersionMatch = DockerVersionMatch.createFromString('prom/prometheus:v2.2.0', '>2.2.0')
      expect(model instanceof DockerVersionMatch);
      expect(model.semverRange === '>2.2.20');      
    });

  });
  
});
