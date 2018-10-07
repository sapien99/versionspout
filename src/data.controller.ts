import {Get, Post, Controller, Body} from '@nestjs/common';
import { AppService } from './app.service';
import { DockerVersionService } from './versions/docker-version.service';
import { Logger } from '@nestjs/common';
import { DockerVersionInputModel } from './versions/models/dockerVersionInputModel';
import { ValidationPipe } from '@nestjs/common';

import { UseGuards} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {DockerModel} from './versions/models/docker.model';

@Controller('versions')
// @UseGuards(AuthGuard('bearer'))
export class DataController {
    constructor(private readonly appService: AppService,
                private readonly dockerService: DockerVersionService ) {}

    @Post()
    async fetch(@Body(new ValidationPipe({transform: true})) body: [DockerVersionInputModel]) {
        // do some verification
        const meta: [DockerModel] = body.map((v: DockerVersionInputModel) => {
            switch ( v.type ) {
                case 'versions': return this.dockerService.createModelFromString(v.artifact);
                default: return null;
            }
        }).filter((m) => m != null) as [DockerModel];

        Logger.log(`Fetching versions from dockerhub: ${JSON.stringify(meta)}`);
        return this.dockerService.fetchAndCompare(meta);
    }
}
