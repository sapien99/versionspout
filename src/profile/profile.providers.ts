import { Connection } from 'mongoose';
import { UserProfileSchema, NotificationStatusSchema } from './models/profile.schema';

export const profileProviders = [
  {
    provide: 'UserProfileToken',
    useFactory: (connection: Connection) => connection.model('UserProfile', UserProfileSchema),
    inject: ['DbConnectionToken'],
  },
  {
    provide: 'NotificationStatusToken',
    useFactory: (connection: Connection) => connection.model('NotificationStatus', NotificationStatusSchema),
    inject: ['DbConnectionToken'],
  },
];
