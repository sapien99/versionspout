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
          'mongodb://localhost:27017/versify',
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
