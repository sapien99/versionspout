import { Connection } from 'mongoose';
import { DockerManifestSchema } from './models/docker.schema';

export const dockerProviders = [
  {
    provide: 'DockerManifestToken',
    useFactory: (connection: Connection) => connection ? connection.model('DockerManifest', DockerManifestSchema) : null,
    inject: ['DbConnectionToken'],
  },
];
