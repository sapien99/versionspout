import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import * as path from 'path';

import { globals } from 'env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // do some swagger - we do not use the handy @nestjs/swagger package, 
  // because we want to have full control  
  app.use('/swagger-ui', express.static(path.join(__dirname, '..', 'swagger')));
  await app.listen(3000);
}
bootstrap();
