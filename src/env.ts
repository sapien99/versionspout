import * as path from 'path';
import * as _ from 'lodash';
import * as fs from 'fs';
import * as yaml from 'js-yaml';

declare function require(name: string);
const pkg = require('../package.json');

function readSmtpConfig() {
  return {
    enabled: process.env.SMTP_HOST || false,
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 25,
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    secure: process.env.SMTP_SECURE == 'true' || false,
    connectionTimeout : normalizeNumber(process.env.SMTP_CONNECTIONTIMEOUT || '5000'),
    greetingTimeout : normalizeNumber(process.env.SMTP_GREETINGTIMEOUT || '5000'),
    socketTimeout : normalizeNumber(process.env.SMTP_SOCKETTIMEOUT || '5000'),
    requireTLS: process.env.SMTP_REQUIRETLS == 'true' || process.env.SMTP_SECURE == 'true' || false,
    // defaults
    from: process.env.SMTP_FROM || '',
    to: process.env.SMTP_TO || '',
    cc: process.env.SMTP_CC || '',
    bcc: process.env.SMTP_BCC || '',
    subject: process.env.SMTP_SUBJECT || '',
    attachments: []
  };
}

function readMongoConfig() {
  return {
    url: process.env.MONGO_URL || '',
    cachetime: normalizeNumber(process.env.MONGO_CACHETIME || '300'),
  };
}

function readGithubConfig() {
  return {
    clientId: process.env.GITHUB_ID || '',
    clientSecret: normalizeNumber(process.env.GITHUB_SECRET || ''),
  };
}

/**
 * Environment and global variables
 */
export const globals = {
  node: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  isDevelopment: process.env.NODE_ENV === 'development',
  expressInstance: null,
  app: {
    name: getOsEnv('APP_NAME'),
    version: (pkg as any).version,
    description: (pkg as any).description,
    route: getOsEnv('APP_ROUTE'),
    routePrefix: getOsEnv('APP_ROUTE_PREFIX'),
    port: normalizeNumber(process.env.PORT || '3000'),
    banner: toBool(getOsEnv('APP_BANNER')),
  },
  mail: readSmtpConfig(),
  mongo: readMongoConfig(),
  github: readGithubConfig(),
  path: {
    root: path.join(__dirname, '..'),
    assets: getOsEnv('ASSETS') || path.join(__dirname, '..', 'mounts', 'assets'),
  },
  log: {
    level: toNumber(getOsEnv('LOG_LEVEL')) || 2,
    json: toBool(getOsEnv('LOG_JSON')),
    output: getOsEnv('LOG_OUTPUT'),
  },
};

function getOsEnv(key: string): string | undefined {
  return process.env[key];
}

function toNumber(value: string): number {
  return parseInt(value, 10);
}

function toBool(value: string): boolean {
  return value === 'true';
}

function normalizeNumber(port: string): number | string | boolean {
  const parsedPort = parseInt(port, 10);
  if (isNaN(parsedPort)) { // named pipe
    return port;
  }
  if (parsedPort >= 0) { // port number
    return parsedPort;
  }
  return false;
}