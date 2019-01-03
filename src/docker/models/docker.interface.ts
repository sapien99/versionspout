import { Document } from 'mongoose';

export interface DockerVersionHashInterface {
    readonly hash: string | null;
}

export interface DockerVersionTagInterface {
    readonly tag: string;
    readonly created: Date | null;        
    readonly size: number;    
}

export interface DockerVersionInterface extends Document {

    readonly repository: string;
    readonly image: string;    
    readonly fetched: Date;
    readonly tags: DockerVersionTagInterface[];

}
