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

  describe('Health (e2e)', () => {
    
   it('/ (GET)', () => {
     return request(app.getHttpServer())
       .get('/healthz')
       .expect(200)      
     });

   it('/ (POST)', () => {
     return request(app.getHttpServer())
       .post('/healthz')
       .expect(404)      
     });

   it('/ (PUT)', () => {
     return request(app.getHttpServer())
        .put('/healthz')
        .expect(404)      
     });
    
   it('/ (PUT)', () => {
     return request(app.getHttpServer())
       .put('/healthz')
       .expect(404)      
     });

  });

  describe('DockerVersion (e2e)', () => {    

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
          expect(_.isArray(resp.body));
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
          expect(_.isArray(resp.body));        
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

  describe('Profile (e2e)', () => {

    let foo = 1;
    it('/profiles/ (POST) with correct data should save a profile', () => {
      return request(app.getHttpServer())
        .post('/profiles')
        .set('Content-Type', 'application/json')
        .send({
            "email": "michael.ferjancic@gmail.com",
            "dockerVersions": [],            
        })
        .expect(201)
        .then((resp: any) => {          
        });
    });

   it('/profiles/ (POST) with incorrect data should return 400', () => {
      return request(app.getHttpServer())
        .post('/profiles')
        .set('Content-Type', 'application/json')
        .send({
            "email": ""
          })
        .expect(400)        
    });    

    it('/profiles/ (DELETE) with no id should return 404', () => {
      return request(app.getHttpServer())
        .delete('/profiles/')
        .set('Content-Type', 'application/json')        
        .expect(404)        
    });    
  });
});
