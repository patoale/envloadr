import {
  CLI_FLAG_LONG_PREFIX,
  CLI_FLAG_SHORT_PREFIX,
  CLI_FLAG_VALUE_SEPARATOR,
  CLI_OPTION_VALUES_SEPARATOR,
} from '@/config';
import { buildHelp } from '@/cli/help';

describe('buildHelp', () => {
  it('should return only the tool usage without any options when the options schema is empty', () => {
    const schema = {};
    const expectedhelp =
      'Usage: envloadr [<options>] <target-command> [<args>]';

    expect(buildHelp(schema)).toBe(expectedhelp);
  });

  it('should return the correct message when the options schema contains a boolean option', () => {
    const inputSchema = {
      flag: {
        description: 'Option description',
        longFlag: 'flag',
        param: 'boolean',
      },
    } as const;
    const expectedMessage = [
      'Usage: envloadr [<options>] <target-command> [<args>]',
      '\nOptions:',
      `\t${CLI_FLAG_LONG_PREFIX}flag[${CLI_FLAG_VALUE_SEPARATOR}true|false]`,
      '\t\tOption description',
    ].join('\n');

    expect(buildHelp(inputSchema)).toBe(expectedMessage);
  });

  it('should return the correct message when the options schema contains a string option', () => {
    const inputSchema = {
      flag: {
        description: 'Option description',
        longFlag: 'flag',
        param: {
          alias: 'value',
          type: 'string',
        },
      },
    } as const;
    const expectedMessage = [
      'Usage: envloadr [<options>] <target-command> [<args>]',
      '\nOptions:',
      `\t${CLI_FLAG_LONG_PREFIX}flag${CLI_FLAG_VALUE_SEPARATOR}<value>`,
      '\t\tOption description',
    ].join('\n');

    expect(buildHelp(inputSchema)).toBe(expectedMessage);
  });

  it('should return the correct message when the options schema contains an option of string array type', () => {
    const inputSchema = {
      flag: {
        description: 'Option description',
        longFlag: 'flag',
        param: {
          alias: 'value',
          type: 'stringArray',
        },
      },
    } as const;
    const expectedMessage = [
      'Usage: envloadr [<options>] <target-command> [<args>]',
      '\nOptions:',
      `\t${CLI_FLAG_LONG_PREFIX}flag${CLI_FLAG_VALUE_SEPARATOR}<value${CLI_OPTION_VALUES_SEPARATOR}value${CLI_OPTION_VALUES_SEPARATOR}...>`,
      '\t\tOption description',
    ].join('\n');

    expect(buildHelp(inputSchema)).toBe(expectedMessage);
  });

  it('should return the correct message when the options schema contains an untyped option', () => {
    const inputSchema = {
      flag: {
        description: 'Option description',
        longFlag: 'flag',
      },
    } as const;
    const expectedMessage = [
      'Usage: envloadr [<options>] <target-command> [<args>]',
      '\nOptions:',
      `\t${CLI_FLAG_LONG_PREFIX}flag`,
      '\t\tOption description',
    ].join('\n');

    expect(buildHelp(inputSchema)).toBe(expectedMessage);
  });

  describe('if option specifications have shortFlag defined', () => {
    it('should return the correct message when the options schema contains a boolean option', () => {
      const inputSchema = {
        flag: {
          description: 'Option description',
          longFlag: 'flag',
          shortFlag: 'f',
          param: 'boolean',
        },
      } as const;
      const expectedMessage = [
        'Usage: envloadr [<options>] <target-command> [<args>]',
        '\nOptions:',
        `\t${CLI_FLAG_LONG_PREFIX}flag[${CLI_FLAG_VALUE_SEPARATOR}true|false], ${CLI_FLAG_SHORT_PREFIX}f[${CLI_FLAG_VALUE_SEPARATOR}true|false]`,
        '\t\tOption description',
      ].join('\n');

      expect(buildHelp(inputSchema)).toBe(expectedMessage);
    });

    it('should return the correct message when the options schema contains a string option', () => {
      const inputSchema = {
        flag: {
          description: 'Option description',
          longFlag: 'flag',
          shortFlag: 'f',
          param: {
            alias: 'value',
            type: 'string',
          },
        },
      } as const;
      const expectedMessage = [
        'Usage: envloadr [<options>] <target-command> [<args>]',
        '\nOptions:',
        `\t${CLI_FLAG_LONG_PREFIX}flag${CLI_FLAG_VALUE_SEPARATOR}<value>, ${CLI_FLAG_SHORT_PREFIX}f${CLI_FLAG_VALUE_SEPARATOR}<value>`,
        '\t\tOption description',
      ].join('\n');

      expect(buildHelp(inputSchema)).toBe(expectedMessage);
    });

    it('should return the correct message when the options schema contains an option of string array type', () => {
      const inputSchema = {
        flag: {
          description: 'Option description',
          longFlag: 'flag',
          shortFlag: 'f',
          param: {
            alias: 'value',
            type: 'stringArray',
          },
        },
      } as const;
      const expectedMessage = [
        'Usage: envloadr [<options>] <target-command> [<args>]',
        '\nOptions:',
        `\t${CLI_FLAG_LONG_PREFIX}flag${CLI_FLAG_VALUE_SEPARATOR}<value${CLI_OPTION_VALUES_SEPARATOR}value${CLI_OPTION_VALUES_SEPARATOR}...>, ${CLI_FLAG_SHORT_PREFIX}f${CLI_FLAG_VALUE_SEPARATOR}<value${CLI_OPTION_VALUES_SEPARATOR}value${CLI_OPTION_VALUES_SEPARATOR}...>`,
        '\t\tOption description',
      ].join('\n');

      expect(buildHelp(inputSchema)).toBe(expectedMessage);
    });
  });
});
