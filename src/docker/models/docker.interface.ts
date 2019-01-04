import { Document } from 'mongoose';

export interface DockerVersionTagInterface {
    readonly tag: string;
    readonly created: Date | null;        
    readonly hashes: string[] | null;    
}

export interface DockerVersionInterface extends Document {

    readonly repository: string;
    readonly image: string;    
    readonly fetched: Date;
    readonly tags: DockerVersionTagInterface[];

}
