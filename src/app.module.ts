import { globals } from './env';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { MailModule } from './mail/mail.module';
import { VersionModule } from './version/version.module';
import { DockerModule } from './docker/docker.module';
import { GithubModule } from './github/github.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
      DatabaseModule,
      DockerModule,
      GithubModule,
      VersionModule,                  
      MailModule,            
      AuthModule,
      ProfileModule, 
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
