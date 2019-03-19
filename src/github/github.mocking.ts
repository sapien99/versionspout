import { GithubVersionProfile } from './models/github.model'
import { VersionProfile, IVersionProfile } from '../version/models/version.model';
import { IVersionProvider } from '../version/version.service';
import { GithubRepository } from './models/github.model';
import { GithubService } from './github.service';

export class GithubVersionProfileMock extends VersionProfile implements IVersionProfile {    
    
    constructor() {        
        super('github', 'prom/prometheus', '.*', []);
    }
}

export class GithubServiceMock extends GithubService implements IVersionProvider {

    async fetchVersions( profile: GithubVersionProfile): Promise<GithubRepository> {
        return new GithubRepository('prom/prometheus', []);        
    }

    constructor() {
        super(null, null);
    }

}
