import {Get, Post, Controller, Body} from '@nestjs/common';
import { AppService } from './app.service';
import { UseGuards} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get('/healthz')
    health(): string {
      return this.appService.healthz();
    }
    
    // do some swagger - we do not use the handy @nestjs/swagger package, 
    // because we want to have full control  
    @Get('/swagger')
    swagger(): string {
      return this.appService.healthz();
    }

}
