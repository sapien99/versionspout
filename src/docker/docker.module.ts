import { Module } from '@nestjs/common';
import { HttpModule} from '@nestjs/common';
import { DockerVersionController } from './docker.controller';
import { DockerVersionSchema} from './models/docker.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { DockerService } from './docker.service';

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
        DockerService
    ],
    controllers: [DockerVersionController],
    providers: [DockerService],
})
export class DockerModule {}
