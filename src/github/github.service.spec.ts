import { githubProviders } from './github.providers';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpModule } from '@nestjs/common';
import { GithubService } from './github.service';
import { GithubVersionProfileMock, GithubServiceMock } from './github.mocking';
import { DatabaseModule } from '../database/database.module';

describe('GithubService', () => {  
  let service: GithubService;   

  const githubVersionManifestMock = new GithubVersionProfileMock();

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule, DatabaseModule],      
      providers:[GithubService, ...githubProviders],    
    })            
    .overrideProvider('GithubRepository')  
    .useValue({
      provide: 'GithubRepositoryMock',
      useFactory: () => githubVersionManifestMock,      
    })  
    .compile();
    service = module.get<GithubService>(GithubService);  
  });
    
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  
});
