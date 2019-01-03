import { Module } from '@nestjs/common';
import { HttpModule} from '@nestjs/common';
import { DockerVersionController } from './docker.controller';
import { DockerVersionSchema} from './models/dockerVersion.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { DockerVersionService } from './docker.service';

@Module({
    imports: [        
        MongooseModule.forFeature([
            {
                name: 'DockerVersion',
                schema: DockerVersionSchema,
            },
        ]),
    ],
    exports: [
        DockerVersionService
    ],
    controllers: [DockerVersionController],
    providers: [DockerVersionService],
})
export class DockerModule {}
