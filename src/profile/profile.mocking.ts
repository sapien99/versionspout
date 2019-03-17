import { IUserProfile, UserProfile } from './models/profile.model';

export class UserProfileMock extends UserProfile implements IUserProfile {    
    
    constructor() {        
        super('someone@foo.com', []);
    }
}
