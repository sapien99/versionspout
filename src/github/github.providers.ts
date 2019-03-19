import { Connection } from 'mongoose';
import { GithubRepositorySchema } from './models/github.schema';

export const githubProviders = [
  {
    provide: 'GithubRepositoryToken',
    useFactory: (connection: Connection) => connection ? connection.model('GithubRepository', GithubRepositorySchema) : null,
    inject: ['DbConnectionToken'],
  },
];
