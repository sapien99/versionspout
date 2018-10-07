
export class CompareRequestModel {

    public readonly repository: string;
    public readonly image: string;
    public tag: string;

    public readonly type: string;
    public readonly allowedRange: string;
    public readonly currentVersion: string;
    public readonly artifact: string;

    constructor(type: string, artifact: string, currentVersion: string | null, allowedRange: string | null) {
        this.type = type;
        this.artifact = artifact;
        this.currentVersion = currentVersion;
        this.allowedRange = allowedRange;
    }

}
