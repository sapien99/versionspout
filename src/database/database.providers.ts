import * as mongoose from 'mongoose';
import { globals } from '../env';

export const databaseProviders = [
  {
    provide: 'DbConnectionToken',
    useFactory: async (): Promise<typeof mongoose> =>
      await mongoose.connect(globals.mongo.url),
  },
];
