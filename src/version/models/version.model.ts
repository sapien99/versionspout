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
    readonly filter: IVersionFilter;
}

export interface IVersionFilter {    
    readonly semver: string;
    readonly published: string;
}

export interface IVersionProfile {
    
    readonly subject: string;
    readonly type: string;    
    filter: IVersionFilter | null;    
    extract: string | null;
    replace: string | null;
    drop: string[];
    keep: string[];    

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

export class VersionFilter implements IVersionFilter {

    readonly semver: string;    
    readonly published: string;    

    constructor(semver: string, published: string) {
        this.semver = semver;
        this.published = published;
    }
}

export class VersionManifest implements IVersionManifest {

    public readonly type: string;        
    public readonly subject: string;    
    public readonly fetched: Date;
    public tags: IVersionTag[];    
    public filter: IVersionFilter;

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
    public filter: IVersionFilter | null;    
    public extract: string | null;
    public replace: string | null;
    public drop: string[];
    public keep: string[];    
    
    public static service: IVersionService;

    constructor(type: string, subject: string, filter: IVersionFilter | null, extract: string | null, replace: string | null, drop: string[] | null, keep: string[] | null) {
        this.type = type;        
        this.subject = subject;        
        this.filter = filter;     
        this.extract = extract;
        this.replace = replace;
        this.drop = drop;
        this.keep = keep;
    }

}
