import {Get, Post, Controller, Body, HttpCode} from '@nestjs/common';
import { VersionService } from './version.service';
import { Logger } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';

import { UseGuards} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { VersionProfile } from './models/version.model';


@Controller('versions')
// @UseGuards(AuthGuard('bearer'))
export class VersionController {

    @Post('/api/versions')
    @HttpCode(200)
    async fetchVersions(@Body(new ValidationPipe({transform: true})) body: VersionProfile[]) {        
        return await this.versionService.fetchAndFilterMany(body);
    }

    constructor(private readonly versionService: VersionService ) {
        VersionProfile.service = versionService;
    }
}
