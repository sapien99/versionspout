import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import * as _ from 'lodash';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/healthz')
      .expect(200)      
  });

  let foo = 1;
  it('/docker-versions/ (POST) with tag specified should return an Array of Docker Versions', () => {
    return request(app.getHttpServer())
      .post('/docker-versions')
      .set('Content-Type', 'application/json')
      .send([
        {
          "allowedRange":"*",
          "repository": "prom",
          "image":"prometheus",
          "tag":"2.2.0"
        }
      ])
      .expect(200)
      .then((resp: any) => {
        expect(_.isArray(resp));
        foo = resp.length;
        expect(foo > 10);
      });
  });

  it('/docker-versions/ (POST) without tag specified should return an even bigger Array of Docker Versions', () => {
    return request(app.getHttpServer())
      .post('/docker-versions')
      .set('Content-Type', 'application/json')
      .send([
        {
          "allowedRange":"*",
          "repository": "prom",
          "image":"prometheus",
        }
      ])
      .expect(200)
      .then((resp: any) => {
        expect(_.isArray(resp));        
        expect(resp.length > foo);
      });
  });

  it('/docker-versions/ (POST) without array should throw 400', () => {
    return request(app.getHttpServer())
      .post('/docker-versions')
      .set('Content-Type', 'application/json')
      .send({
        "allowedRange":"*",
        "repository": "prom",
        "image":"prometheus",
      })
      .expect(400)      
  });

});
