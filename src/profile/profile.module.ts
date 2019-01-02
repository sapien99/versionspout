import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileSchema} from './models/profile.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ProfileService } from './profile.service';
import { MailModule } from '../mail/mail.module';
import { DockerModule } from 'docker/docker.module';

@Module({
    imports: [      
        MailModule,  
        DockerModule,
        /* MongooseModule.forFeature([
            {
                name: 'DockerVersion',
                schema: DockerVersionSchema,
            },
        ]), */
    ],
    controllers: [ProfileController],
    providers: [ProfileService],
})
export class ProfileModule {}
