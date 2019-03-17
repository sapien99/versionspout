import { Connection } from 'mongoose';
import { UserProfileSchema, NotificationStatusSchema } from './models/profile.schema';

export const profileProviders = [
  {
    provide: 'UserProfileToken',
    useFactory: (connection: Connection) => connection ? connection.model('UserProfile', UserProfileSchema) : null,
    inject: ['DbConnectionToken'],
  },
  {
    provide: 'NotificationStatusToken',
    useFactory: (connection: Connection) => connection ? connection.model('NotificationStatus', NotificationStatusSchema) : null,
    inject: ['DbConnectionToken'],
  },
];
