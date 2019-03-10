import {Get, Post, Controller, Body, HttpCode} from '@nestjs/common';
import { DockerService } from './docker.service';
import { Logger } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';

import { UseGuards} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DockerVersionMatch, DockerImage } from './models/docker.model';


@Controller('docker')
// @UseGuards(AuthGuard('bearer'))
export class DockerVersionController {

    @Post('/api/docker-versions')
    @HttpCode(200)
    async fetchVersions(@Body(new ValidationPipe({transform: true})) body: DockerVersionMatch[]) {        
        return await this.dockerService.fetchAndCompareMany(body);
    }

    /**
     * Imports versions from k8s dump in 
     *
     * kubectl get pods --all-namespaces -o jsonpath="{.items[*].spec.containers[*].image}"
     *
     * compatible format
     * @param body
     */
    @Post('/k8s-import')
    @HttpCode(200)
    async k8sImport(@Body(new ValidationPipe({transform: true})) body: string) {
        const test = 'prom/prometheus:v2.2.0 grafana/grafana:5.2.2';
        // split input string (separated by blank)
        const requests: DockerVersionMatch[] = test.split(' ')
            .map((artifact) => {
                // TODO: we should be able to remove this
                const model: DockerVersionMatch = this.dockerService.createModelFromString(artifact);
                return new DockerVersionMatch(model.repository, model.image, model.tag, null, null);
            }) as DockerVersionMatch[];
        return await Promise.all(requests.map((meta: DockerVersionMatch) => meta.fetchAndCompare()));
    }

    constructor(private readonly dockerService: DockerService ) {
        DockerVersionMatch.service = dockerService;
    }
}
