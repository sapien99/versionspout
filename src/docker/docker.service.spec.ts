import { dockerProviders } from './docker.providers';
import { Test, TestingModule } from '@nestjs/testing';
import { DockerVersionProfile } from './models/docker.model';
import { DockerService } from './docker.service';
import { DockerVersionProfileMock, DockerServiceMock } from './docker.mocking';
import { DatabaseModule } from '../database/database.module';

describe('DockerService', () => {  
  let service: DockerService;   

  const dockerVersionManifestMock = new DockerVersionProfileMock();

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule],      
      providers:[DockerService, ...dockerProviders],    
    })    
    .overrideProvider('DockerManifest')  
    .useValue({
      provide: 'DockerManifestMock',
      useFactory: () => dockerVersionManifestMock,      
    })  
    .compile();
    service = module.get<DockerService>(DockerService);  
  });
    
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  
});
