import { IVersionService } from '../../version/version.service';

export interface IVersionTag {
    readonly type: string;    
    readonly tag: string;    
    readonly published: Date | null;        
    data: any | null;
    isSemver: boolean;    
}

export interface IVersionManifest {
    readonly type: string;        
    readonly subject: string;    
    readonly fetched: Date;
    readonly tags: IVersionTag[];
    readonly semver: string;
}

export interface IVersionProfile {
    
    readonly subject: string;
    readonly type: string;    
    semver: string | null;    
}

export class VersionTag implements IVersionTag {

    readonly type: string;
    public tag: string;
    public published: Date | null;
    public isSemver: boolean;
    public data: any;    

    constructor(type: string, tag: string) {
        this.type = type;
        this.tag = tag;
        this.published = null;
        this.data = null;       
    }
}

export class VersionManifest implements IVersionManifest {

    public readonly type: string;        
    public readonly subject: string;    
    public readonly fetched: Date;
    public tags: IVersionTag[];
    public semver: string;

    constructor(type: string, subject: string, tags: IVersionTag[]) {
        this.type = type;        
        this.subject = subject;
        this.tags = tags;
    }

}

/**
 * A docker "profile" matching on image, repository and several tags
 */
export class VersionProfile implements IVersionProfile {
    
    public readonly subject: string;
    public readonly type: string;    
    public semver: string | null;    
    public ignorePatterns: string[];

    public static service: IVersionService;

    constructor(type: string, subject: string, semver: string | null, ignorePatterns: string[] | null) {
        this.type = type;        
        this.subject = subject;        
        this.semver = semver;     
        this.ignorePatterns = ignorePatterns;
    }

}
