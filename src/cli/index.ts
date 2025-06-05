import { spawn } from 'child_process';
import {
  DEFAULT_ENV_FILE_PATH,
  DEFAULT_OVERRIDE,
  DEFAULT_VERBOSE,
} from '@/config';
import { parseEnvFiles } from '@/envFile';
import { parse } from './parser';
import schema from './schema';
import { buildHelp } from './help';
import type { Options } from './parser/types';

function normalizeOptions(options: Options<typeof schema> | undefined) {
  const files = options?.files ?? [DEFAULT_ENV_FILE_PATH];
  const override =
    options?.noOverride !== undefined ? !options.noOverride : DEFAULT_OVERRIDE;
  const verbose = options?.verbose ?? DEFAULT_VERBOSE;

  return { files, override, verbose };
}

export function run() {
  const args = process.argv.slice(2);

  const { command, options } = parse(args, schema);
  if (options?.help !== undefined) {
    console.log(buildHelp(schema));
    return;
  }

  const { files, override, verbose } = normalizeOptions(options);
  const env = parseEnvFiles(files, { override, verbose });

  spawn(command.name, command.args, {
    stdio: 'inherit',
    env: override ? { ...process.env, ...env } : { ...env, ...process.env },
  });
}
