import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth.module';
import { VersionModule } from './versions/version.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
      MongooseModule.forRoot(
          'mongodb://localhost:27017/nest',
          { useNewUrlParser: true },
      ),
      AuthModule,
      VersionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
