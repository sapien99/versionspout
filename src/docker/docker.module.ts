import { Module } from '@nestjs/common';
import { HttpModule} from '@nestjs/common';
import { DockerVersionController } from './docker-version.controller';
import { DockerVersionSchema} from './models/dockerVersion.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { DockerVersionService } from './docker-version.service';

@Module({
    imports: [
        HttpModule.register({
            timeout: 5000,
            maxRedirects: 5,
        }),
        /* MongooseModule.forFeature([
            {
                name: 'DockerVersion',
                schema: DockerVersionSchema,
            },
        ]), */
    ],
    controllers: [DockerVersionController],
    providers: [DockerVersionService],
})
export class DockerModule {}
