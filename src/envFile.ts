import { readFileSync } from 'fs';
import { ENV_FILE_COMMENT_PREFIX, KEY_VALUE_SEPARATOR } from './config';
import { type Env } from './types';

function isSkippableLine(line: string) {
  const trimmedLine = line.trim();

  return !trimmedLine || trimmedLine.startsWith(ENV_FILE_COMMENT_PREFIX);
}

function isQuotedValue(value: string) {
  return (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  );
}

export function parseEnvFile(
  pathname: string,
  { override, verbose }: { override: boolean; verbose: boolean },
): Env {
  const result: Env = {};
  let fileContent;

  try {
    fileContent = readFileSync(pathname, 'utf-8');
  } catch (error) {
    throw new Error(`Error parsing "${pathname}": ${(error as Error).message}`);
  }

  if (verbose) {
    console.log(`Parsing file "${pathname}"`);
  }

  fileContent.split('\n').forEach((line, i) => {
    if (isSkippableLine(line)) return;

    const separatorIndex = line.indexOf(KEY_VALUE_SEPARATOR);
    if (separatorIndex === -1) {
      throw new Error(
        `Error parsing line ${i + 1} of "${pathname}": Invalid variable separator, expected "NAME${KEY_VALUE_SEPARATOR}VALUE" format`,
      );
    }

    const key = line.slice(0, separatorIndex).trim();
    if (!key) {
      throw new Error(
        `Error parsing line ${i + 1} of "${pathname}": Variable name not found, expected "NAME${KEY_VALUE_SEPARATOR}VALUE" format`,
      );
    }

    const hasKey = key in result;
    if (!override && hasKey) return;

    const value = line
      .slice(separatorIndex + KEY_VALUE_SEPARATOR.length)
      .trim();

    result[key] = isQuotedValue(value) ? value.slice(1, -1) : value;

    if (verbose) {
      console.log(
        `Successfully ${override && hasKey ? 'overridden' : 'parsed'}: ${key} = ${result[key]}`,
      );
    }
  });

  return result;
}
