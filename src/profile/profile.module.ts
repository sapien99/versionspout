import { Module, HttpModule } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { UserProfileSchema, NotificationStatusSchema } from './models/profile.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ProfileService } from './profile.service';
import { MailModule } from '../mail/mail.module';
import { VersionModule } from '../version/version.module';

@Module({
    imports: [       
        HttpModule,               
        MailModule,
        VersionModule,
        MongooseModule.forFeature([
            {
                name: 'UserProfile',
                schema: UserProfileSchema,
            },
            {
                name: 'NotificationStatus',
                schema: NotificationStatusSchema,
            },            
        ]),
    ],
    exports: [
        ProfileService
    ],
    controllers: [ProfileController],
    providers: [ProfileService],
})
export class ProfileModule {}
