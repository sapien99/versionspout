import { DockerVersionProfile } from './models/docker.model'
import { VersionProfile, IVersionProfile } from '../version/models/version.model';
import { IVersionProvider } from '../version/version.service';
import { DockerManifest } from './models/docker.model';
import { DockerService } from './docker.service';

export class DockerVersionProfileMock extends VersionProfile implements IVersionProfile {    
    
    constructor() {        
        super('docker', 'prom/prometheus', '.*', []);
    }
}

export class DockerServiceMock extends DockerService implements IVersionProvider {

    async fetchVersions( profile: DockerVersionProfile): Promise<DockerManifest> {
        return new DockerManifest('prom/prometheus', []);        
    }

    constructor() {
        super(null);
    }

}
