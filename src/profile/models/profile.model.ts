import { DockerVersionMatch } from '../../docker/models/docker.model';
import { IsNotEmpty, IsEmail } from 'class-validator';

export interface INotificationChannel {
    readonly name: string;    
    readonly type: string,
    readonly config: any;    
}

export interface INotificationStatus {    
    readonly _id: string;
    readonly email: string;
    readonly channel: string;
    readonly image: string;
    readonly tag: string;
    readonly date: Date;
}

export interface IUserProfile {
    readonly email: string;
    readonly htmlEmail: boolean;
    readonly notificationChannels : INotificationChannel[];
    readonly defaults: {
        notificationChannels: string[],        
        semverIgnorePatterns: string[],
    }
    readonly subscribedDockerVersions: DockerVersionProfile[];        
}

export class DockerVersionProfile extends DockerVersionMatch {
    public notificationChannels: string[]
    public semverIgnorePatterns: string[]
}

export class UserProfile implements IUserProfile {
    @IsNotEmpty()
    @IsEmail()
    public readonly email: string;
    public readonly htmlEmail: boolean;
    // configured notification channels     
    public notificationChannels :INotificationChannel[];    
    // defaults
    public defaults: {
        notificationChannels: string[],        
        semverIgnorePatterns: string[],
    }
    // docker version profile - semver
    @IsNotEmpty()
    public readonly subscribedDockerVersions: DockerVersionProfile[];        

    constructor(email: string, dockerVersions: DockerVersionProfile[]) {
        this.email = email;
        this.subscribedDockerVersions = dockerVersions;    
    }
}

export class NotificationStatus implements INotificationStatus {
    readonly _id: string; 
    readonly email: string; 
    readonly image: string; 
    readonly tag: string; 
    readonly channel: string; 
    readonly date: Date;

    public static createKey(email: string, channel:string, image:string, tag:string) {                
        return `${email}|${channel}|${image}:${tag}`;
    }

    constructor(email: string, channel:string, image:string, tag:string) {
        this._id = NotificationStatus.createKey(email, channel, image, tag);
        this.email = email;
        this.image = image;
        this.tag = tag;
        this.channel = channel;
        this.date = new Date();
    }
}
