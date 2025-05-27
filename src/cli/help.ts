import {
  CLI_FLAG_LONG_PREFIX,
  CLI_FLAG_SHORT_PREFIX,
  CLI_FLAG_VALUE_SEPARATOR,
  CLI_OPTION_VALUES_SEPARATOR,
} from '@/config';
import type { OptionSpecParam, SpecSchema } from './parser/types';

function buildParamPlaceholder(param: OptionSpecParam) {
  if (param === 'boolean') {
    return `[${CLI_FLAG_VALUE_SEPARATOR}true|false]`;
  }

  const { alias, type } = param;

  return type === 'string'
    ? `${CLI_FLAG_VALUE_SEPARATOR}<${alias}>`
    : `${CLI_FLAG_VALUE_SEPARATOR}<${alias}${CLI_OPTION_VALUES_SEPARATOR}${alias}${CLI_OPTION_VALUES_SEPARATOR}...>`;
}

export function buildHelp(schema: SpecSchema) {
  const result = ['Usage: envloadr [<options>] <target-command>'];

  const specs = Object.values(schema);
  if (specs.length === 0) return result.toString();

  result.push('\n\nOptions:');
  Object.values(schema).forEach(
    ({ description, longFlag, shortFlag, param }) => {
      result.push(`\n\t${CLI_FLAG_LONG_PREFIX}${longFlag}`);
      if (param !== undefined) {
        result.push(buildParamPlaceholder(param));
      }
      if (shortFlag !== undefined) {
        result.push(`, ${CLI_FLAG_SHORT_PREFIX}${shortFlag}`);
        if (param !== undefined) {
          result.push(buildParamPlaceholder(param));
        }
      }
      result.push(`\n\t\t${description}`);
    },
  );

  return result.join('');
}
