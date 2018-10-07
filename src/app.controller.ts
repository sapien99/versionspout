import {Get, Post, Controller, Body} from '@nestjs/common';
import { AppService } from './app.service';
import { UseGuards} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get('/healthz')
    health(): string {
      return this.appService.health();
  }

    @Post()
    @UseGuards(AuthGuard('bearer'))
    async fetch(@Body() body: any) {
        return this.appService.fetch(JSON.stringify(body));
    }
}
