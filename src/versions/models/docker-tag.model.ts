
export class DockerTagModel {

    public name: string;
    public created: Date | null;

    constructor(name: string, updated: Date | null) {
        this.name = name;
        this.created = updated;
    }

}
