import {
  CLI_FLAG_LONG_PREFIX,
  CLI_FLAG_SHORT_PREFIX,
  CLI_FLAG_VALUE_SEPARATOR,
  CLI_OPTION_VALUES_SEPARATOR,
} from '@/config';
import type { Args, Options, OptionSpecParam, SpecSchema } from './types';

function isBlankString(str: string) {
  return str.trim().length === 0;
}

function classifyArgs(args: string[]) {
  const options = [];
  let command = undefined;

  for (const [i, arg] of args.entries()) {
    if (arg.startsWith(CLI_FLAG_LONG_PREFIX)) {
      options.push(arg.substring(CLI_FLAG_LONG_PREFIX.length));
    } else if (arg.startsWith(CLI_FLAG_SHORT_PREFIX)) {
      options.push(arg.substring(CLI_FLAG_SHORT_PREFIX.length));
    } else {
      command = args.slice(i).join(' ');
      break;
    }
  }

  return { options, command };
}

function parseBoolean(value: string | undefined, flag: string) {
  if (value === undefined) return true;

  const valueLower = value.toLowerCase();
  if (valueLower === 'true') return true;
  if (valueLower === 'false') return false;

  throw new Error(
    `Error parsing CLI input: Invalid value for boolean option "${flag}"`,
  );
}

function parseValue(
  value: string | undefined,
  param: OptionSpecParam,
  flag: string,
) {
  if (param === 'boolean') return parseBoolean(value, flag);
  else {
    if (value === undefined) {
      throw new Error(
        `Error parsing CLI input: Expected value for option "${flag}"`,
      );
    }

    if (param.type === 'string') return value;
    return value.split(CLI_OPTION_VALUES_SEPARATOR);
  }
}

function parseOption(inputOption: string, schema: SpecSchema) {
  const [flag, value] = inputOption.split(CLI_FLAG_VALUE_SEPARATOR);
  if (!flag) {
    throw new Error('Error parsing CLI input: Missing option flag');
  }
  if (isBlankString(flag)) {
    throw new Error('Error parsing CLI input: Invalid option flag');
  }

  const optionPair = Object.entries(schema).find(
    ([, { longFlag, shortFlag }]) => flag === longFlag || flag === shortFlag,
  );
  if (optionPair === undefined) {
    throw new Error(`Error parsing CLI input: Unknown option "${flag}"`);
  }

  const [name, { param }] = optionPair;
  if (param === undefined && value !== undefined) {
    throw new Error(
      `Error parsing CLI input: Unexpected value for option "${flag}"`,
    );
  }

  return {
    name,
    value: param ? parseValue(value, param, flag) : true,
  };
}

function parseOptions<T extends SpecSchema>(inputOptions: string[], schema: T) {
  const result: Record<string, unknown> = {};

  inputOptions.forEach((inputOption) => {
    const { name, value } = parseOption(inputOption, schema);
    result[name] = value;
  });

  return result as Options<T>;
}

function parseCommand(command: string) {
  const tokens = command.split(/\s+/);

  return {
    name: tokens[0],
    args: tokens.slice(1),
  };
}

export function parse<T extends SpecSchema>(
  input: string[],
  schema: T,
): Args<T> {
  const { options, command } = classifyArgs(input);
  if (command === undefined) {
    throw new Error('Error parsing CLI input: Missing target command');
  }
  if (isBlankString(command)) {
    throw new Error('Error parsing CLI input: Invalid target command');
  }

  if (options.length === 0) {
    return {
      command: parseCommand(command),
    };
  }

  return {
    options: parseOptions(options, schema),
    command: parseCommand(command),
  };
}
