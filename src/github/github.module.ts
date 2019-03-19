import { DatabaseModule } from '../database/database.module';
import { Module, HttpModule } from '@nestjs/common';
import { GithubService } from './github.service';
import { githubProviders } from './github.providers';

@Module({
    imports: [
        HttpModule,
        DatabaseModule
    ],
    exports: [
        GithubService,
    ],
    controllers: [],
    providers: [GithubService, ...githubProviders],
})
export class GithubModule {}
