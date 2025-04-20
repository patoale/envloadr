import { type Env } from './types';

export declare function parseEnvFile(
  pathname: string,
  { override, verbose }: { override: boolean; verbose: boolean },
): Env;
