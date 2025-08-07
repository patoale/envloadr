import { spawn } from 'child_process';
import {
  DEFAULT_ENV_FILE_PATH,
  DEFAULT_OVERRIDE,
  DEFAULT_VERBOSE,
} from '@/config';
import { parseEnvFiles } from '@/envFile';
import { buildHelp } from './help';
import { parse } from './parser';
import schema from './schema';
import { syncEvents } from './utils/childProcess';
import type { Command, Options } from './parser/types';

function normalizeOptions(options: Options<typeof schema> | undefined) {
  const files = options?.files ?? [DEFAULT_ENV_FILE_PATH];
  const override =
    options?.noOverride !== undefined ? !options.noOverride : DEFAULT_OVERRIDE;
  const verbose = options?.verbose ?? DEFAULT_VERBOSE;

  return { files, override, verbose };
}

function executeCommand({ args, name }: Command, env: NodeJS.ProcessEnv) {
  const child = spawn(name, args, {
    stdio: 'inherit',
    env,
  });

  syncEvents(process, child);
}

export function run() {
  const args = process.argv.slice(2);

  const { command, options } = parse(args, schema);
  if (options?.help !== undefined) {
    console.log(buildHelp(schema));
    return;
  }

  const { files, override, verbose } = normalizeOptions(options);
  const customEnv = parseEnvFiles(files, { override, verbose });

  const env = override
    ? { ...process.env, ...customEnv }
    : { ...customEnv, ...process.env };
  executeCommand(command, env);
}
