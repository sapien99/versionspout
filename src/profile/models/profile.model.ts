import { VersionProfile } from '../../version/models/version.model';
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
        notificationChannels: string[]        
    }
    readonly subscribedVersions: UserVersionProfile[];        
}

export class UserVersionProfile extends VersionProfile {    
    public notificationChannels: string[]        
}

export class UserProfileDefaults {    
    public notificationChannels: string[]                  
    public ignorePatterns: string[]   
}

export class UserProfile implements IUserProfile {    
    @IsNotEmpty()
    @IsEmail()
    public readonly email: string;    
    public readonly htmlEmail: boolean;
    // configured notification channels    
    public notificationChannels :INotificationChannel[];    
    // defaults    
    public defaults: UserProfileDefaults;        
    // docker version profile - semver    
    @IsNotEmpty()
    public readonly subscribedVersions: UserVersionProfile[];        
    
    constructor(email: string, subscribedVersions: UserVersionProfile[]) {
        this.email = email;
        this.subscribedVersions = subscribedVersions;    
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
