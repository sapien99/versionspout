import { Module } from '@nestjs/common';
import { VersionController } from './version.controller';
import { VersionService } from './version.service';
import { DockerModule } from '../docker/docker.module';
import { DatabaseModule } from '../database/database.module';
import { GithubModule } from '../github/github.module';

@Module({
    imports: [        
        DatabaseModule,
        DockerModule,
        GithubModule,
    ],
    exports: [
        VersionService
    ],
    controllers: [VersionController],
    providers: [VersionService],
})
export class VersionModule {}
