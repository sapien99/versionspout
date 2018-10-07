import {Get, Post, Controller, Body} from '@nestjs/common';
import { DockerVersionService } from './docker-version.service';
import { Logger } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';

import { UseGuards} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {DockerVersionModel} from './models/docker.model';
import { DockerCompareRequestModel } from './models/docker-compare-request.model';
import { CompareRequestModel } from './models/compare-request.model';


@Controller('versions')
// @UseGuards(AuthGuard('bearer'))
export class VersionController {

    @Post()
    async fetch(@Body(new ValidationPipe({transform: true})) body: CompareRequestModel[]) {
        const requests: DockerCompareRequestModel[] = body.map((v: CompareRequestModel) => {
            return DockerCompareRequestModel.createFromCompareRequestModel(v);
        }).filter((m) => m != null) as [DockerCompareRequestModel];
        return await Promise.all(requests.map((meta: DockerCompareRequestModel) => meta.fetchAndCompare()));
    }

    /**
     * Imports versions in a
     *
     * kubectl get pods --all-namespaces -o jsonpath="{.items[*].spec.containers[*].image}"
     *
     * compatible format
     * @param body
     */
    @Get()
    async k8sImport(@Body(new ValidationPipe({transform: true})) body: string) {
        const test = 'prom/prometheus:v2.2.0';
        // split input string (separated by blank)
        const requests: DockerCompareRequestModel[] = test.split(' ')
            .map((artifact) => {
                const model: DockerVersionModel = this.dockerService.createModelFromString(artifact);
                return new DockerCompareRequestModel(model.repository, model.image, model.tag, null, null);
            }) as DockerCompareRequestModel[];
        return await Promise.all(requests.map((meta: DockerCompareRequestModel) => meta.fetchAndCompare()));
    }

    constructor(private readonly dockerService: DockerVersionService ) {
        DockerCompareRequestModel.service = dockerService;
    }
}
