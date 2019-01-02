import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();
  });

  describe('healthz', () => {
    it('should return 200 and UP', () => {
      const appController = app.get<AppController>(AppController);
      expect(appController.health()).toBe('UP');
    });
  });
});
