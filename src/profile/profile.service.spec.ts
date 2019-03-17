import { MailModule } from './../mail/mail.module';
import { profileProviders } from './profile.providers';
import { Test, TestingModule } from '@nestjs/testing';
import { ProfileService } from './profile.service';
import { UserProfileMock } from './profile.mocking';
import { DatabaseModule } from '../database/database.module';
import { VersionModule } from '../version/version.module';
import { HttpModule } from '@nestjs/common';

describe('ProfileService', () => {  
  let service: ProfileService;   

  const userProfileMock = new UserProfileMock();

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        DatabaseModule, 
        VersionModule, 
        HttpModule, 
        MailModule
      ],      
      providers:[ProfileService, ...profileProviders],    
    })    
    .overrideProvider('UserProfile')  
    .useValue({
      provide: 'UserProfileToken',
      useFactory: () => userProfileMock,      
    })  
    .overrideProvider('NotificationStatus')  
    .useValue({
      provide: 'NotificationStatusToken',
      useFactory: () => null,      
    })  
    .compile();
    service = module.get<ProfileService>(ProfileService);  
  });
    
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  
});
