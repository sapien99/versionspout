import { Test, TestingModule } from '@nestjs/testing';
import { VersionService } from './version.service';
import { DockerModule } from '../docker/docker.module';
import { GithubModule } from '../github/github.module';

describe('VersionService', () => {  
  let service: VersionService;   

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DockerModule, GithubModule,],      
      providers:[VersionService],    
    })        
    .compile();
    service = module.get<VersionService>(VersionService);  
  });
    
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  
});
