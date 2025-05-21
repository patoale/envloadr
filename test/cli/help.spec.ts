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
      '\t--flag[=true|false]',
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
      '\t--flag=<value>',
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
        '\t--flag[=true|false], -f[=true|false]',
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
        '\t--flag=<value>, -f=<value>',
        '\t\tOption description',
      ].join('\n');

      expect(buildHelp(inputSchema)).toBe(expectedMessage);
    });
  });
});
