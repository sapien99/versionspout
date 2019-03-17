import { DockerManifestSchema } from './models/docker.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DockerService } from './docker.service';

@Module({
    imports: [        
        MongooseModule.forFeature([
            {
                name: 'DockerManifest',
                schema: DockerManifestSchema,
            },
        ]),
    ],
    exports: [
        DockerService,
    ],
    controllers: [],
    providers: [DockerService],
})
export class DockerModule {}
