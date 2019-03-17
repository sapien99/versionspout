import { Module, HttpModule } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { MailModule } from '../mail/mail.module';
import { VersionModule } from '../version/version.module';
import { DatabaseModule } from '../database/database.module';
import { profileProviders } from './profile.providers';

@Module({
    imports: [       
        HttpModule,               
        MailModule,
        DatabaseModule,
        VersionModule,        
    ],
    exports: [
        ProfileService
    ],
    controllers: [ProfileController],
    providers: [ProfileService, ...profileProviders],
})
export class ProfileModule {}
