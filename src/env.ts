import * as path from 'path';
import * as _ from 'lodash';
import * as fs from 'fs';
import * as yaml from 'js-yaml';

declare function require(name: string);
const pkg = require('../package.json');

function readSmtpConfig(configpath, secretpath) {
  if (path) {
    const config = yaml.safeLoad(fs.readFileSync(configpath, 'utf8'));
    const secret = yaml.safeLoad(fs.readFileSync(secretpath, 'utf8'));
    if (!config.smtp || !config.smtp.enabled)
      return {
        enabled: false
      }
    return {
      enabled: true,
      host: config.smtp.host,
      port: config.smtp.port || 25,
      user: secret.smtp.user,      
      password: secret.smtp.password,
      secure: config.smtp.secure || false,    
      connectionTimeout : normalizeNumber(process.env.MAIL_CONNECTIONTIMEOUT || config.smtp.connectionTimeout || '5000'),
      greetingTimeout : normalizeNumber(process.env.MAIL_GREETINGTIMEOUT || config.smtp.greetingTimeout || '5000'),
      socketTimeout : normalizeNumber(process.env.MAIL_SOCKETTIMEOUT || config.smtp.socketTimeout || '5000'),
      // defaults
      from: config.smtp.from,
      to: config.smtp.to,
      cc: config.smtp.cc,
      bcc: config.smtp.bcc,
      subject: config.smtp.subject,
      attachments: config.smtp.attachments,
    };
  }
}

function readMongoConfig(configpath, secretpath) {
  if (path) {
    const config = yaml.safeLoad(fs.readFileSync(configpath, 'utf8'));    
    return {
      url: config.mongo.url,
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
  mail: readSmtpConfig(
    getOsEnv('CONFIG') || path.join(__dirname, '..', 'mounts', 'configmaps', 'config.yaml'),
    getOsEnv('PASSWORDS') || path.join(__dirname, '..', 'mounts', 'secrets', 'creds.yaml')
  ),  
  mongo: readMongoConfig(
    getOsEnv('CONFIG') || path.join(__dirname, '..', 'mounts', 'configmaps', 'config.yaml'),
    getOsEnv('PASSWORDS') || path.join(__dirname, '..', 'mounts', 'secrets', 'creds.yaml')
  ),
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