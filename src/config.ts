import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { load } from 'js-yaml';
import { merge } from 'es-toolkit';
import { BaseConfig, EnvConfig } from '../types/config';

export default async () => {
  const BASE_CONFIG_FILENAME = 'base.yaml';
  const baseConfigPath = join(__dirname, '../env', BASE_CONFIG_FILENAME);
  const envPath = join(__dirname, '../env', `${process.env.NODE_ENV || 'development'}.yaml`);

  const baseConfigString = await readFile(baseConfigPath, {
    encoding: 'utf-8',
  });
  const envConfigString = await readFile(envPath, {
    encoding: 'utf-8',
  });

  const baseConfig = load(baseConfigString) as BaseConfig;
  const envConfig = load(envConfigString) as EnvConfig;
  return merge(baseConfig, envConfig);
};
