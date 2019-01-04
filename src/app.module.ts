import { globals } from './env';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MailModule } from './mail/mail.module';
import { DockerModule } from './docker/docker.module';

@Module({
  imports: [
      MongooseModule.forRoot(
          globals.mongo.url,
          { useNewUrlParser: true },
      ),      
      AuthModule,
      MailModule,      
      DockerModule,      
      ProfileModule, 
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
