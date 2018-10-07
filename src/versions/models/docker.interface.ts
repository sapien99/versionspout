import { Document } from 'mongoose';

export interface DockerVersionInterface extends Document {

    readonly repository: string;
    readonly image: string;
    readonly tag: string;
    readonly fetched: Date;
    readonly created: Date | null;
    readonly hash: string | null;
    readonly size: number;

}
