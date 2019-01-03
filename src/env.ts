import * as path from 'path';
import * as _ from 'lodash';
import * as fs from 'fs';
import * as yaml from 'js-yaml';

declare function require(name: string);
const pkg = require('../package.json');

function readSmtpConfig(path) {
  if (path) {
    const doc = yaml.safeLoad(fs.readFileSync(path, 'utf8'));
    return {
      host: doc.smtp.host,
      port: doc.smtp.port || 25,
      user: doc.smtp.user,
      password: doc.smtp.password,
      secure: doc.smtp.secure || false,
      testmail_to: process.env.MAIL_TESTUSER,
      connectionTimeout : normalizeNumber(process.env.MAIL_CONNECTIONTIMEOUT || '5000'),
      greetingTimeout : normalizeNumber(process.env.MAIL_GREETINGTIMEOUT || '5000'),
      socketTimeout : normalizeNumber(process.env.MAIL_SOCKETTIMEOUT || '5000'),
    };
  }
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
  mail: readSmtpConfig(getOsEnv('SMTP_SECRET') || path.join(__dirname, '..', 'mounts', 'secrets', 'smtp_creds.yaml')),  
  path: {
    root: path.join(__dirname, '..'),
    profiles: path.join(__dirname, '..', 'mounts', 'profiles'),
    assets: path.join(__dirname, '..', 'mounts', 'assets'),
  },
  log: {
    level: getOsEnv('LOG_LEVEL'),
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