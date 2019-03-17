import { DatabaseModule } from './../database/database.module';
import { Module } from '@nestjs/common';
import { DockerService } from './docker.service';
import { dockerProviders } from './docker.providers';

@Module({
    imports: [
        DatabaseModule
    ],
    exports: [
        DockerService,
    ],
    controllers: [],
    providers: [DockerService, ...dockerProviders],
})
export class DockerModule {}
