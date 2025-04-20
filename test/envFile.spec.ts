import fs from 'fs';
import { ENV_FILE_COMMENT_PREFIX, KEY_VALUE_SEPARATOR } from '@/config';
import { parseEnvFile } from '@/envFile';

describe('Environment file parser', () => {
  let readFileSyncSpy: jest.SpyInstance;

  beforeEach(() => {
    readFileSyncSpy = jest.spyOn(fs, 'readFileSync');
  });

  afterEach(() => {
    readFileSyncSpy.mockRestore();
  });

  // Genral format validation

  it('should read env vars correctly when key-value pairs are well-formed', () => {
    const fileContent = [
      `KEY_1${KEY_VALUE_SEPARATOR}value_1`,
      `KEY_2${KEY_VALUE_SEPARATOR}value_2`,
      `KEY_3${KEY_VALUE_SEPARATOR}value_3`,
    ].join('\n');

    const expectedEnv = {
      KEY_1: 'value_1',
      KEY_2: 'value_2',
      KEY_3: 'value_3',
    };

    readFileSyncSpy.mockReturnValue(fileContent);

    expect(
      parseEnvFile('.env.mock', { override: false, verbose: false }),
    ).toEqual(expectedEnv);
  });

  it('should read env vars correctly when exists spaces around the key-value separators', () => {
    const fileContent = [
      `KEY_1 ${KEY_VALUE_SEPARATOR} value_1`,
      `KEY_2  ${KEY_VALUE_SEPARATOR}  value_2`,
    ].join('\n');

    const expectedEnv = {
      KEY_1: 'value_1',
      KEY_2: 'value_2',
    };

    readFileSyncSpy.mockReturnValue(fileContent);

    expect(
      parseEnvFile('.env.mock', { override: false, verbose: false }),
    ).toEqual(expectedEnv);
  });

  it('should read the value correctly when values contain spaces', () => {
    const fileContent = [
      `KEY_1${KEY_VALUE_SEPARATOR}value_1 with spaces`,
      `KEY_2${KEY_VALUE_SEPARATOR}value_2  with  spaces`,
    ].join('\n');

    const expectedEnv = {
      KEY_1: 'value_1 with spaces',
      KEY_2: 'value_2  with  spaces',
    };

    readFileSyncSpy.mockReturnValue(fileContent);

    expect(
      parseEnvFile('.env.mock', { override: false, verbose: false }),
    ).toEqual(expectedEnv);
  });

  it(`should ignore lines when they start with ${ENV_FILE_COMMENT_PREFIX}`, () => {
    const fileContent = [
      `${ENV_FILE_COMMENT_PREFIX} This is a comment`,
      `KEY_1${KEY_VALUE_SEPARATOR}value_1`,
      `KEY_2${KEY_VALUE_SEPARATOR}value_2`,
      `${ENV_FILE_COMMENT_PREFIX} Another comment`,
    ].join('\n');

    const expectedEnv = {
      KEY_1: 'value_1',
      KEY_2: 'value_2',
    };

    readFileSyncSpy.mockReturnValue(fileContent);

    expect(
      parseEnvFile('.env.mock', { override: false, verbose: false }),
    ).toEqual(expectedEnv);
  });

  it('should read the value as an empty string when the value is missing from key-value pairs', () => {
    const fileContent = [
      `KEY_1${KEY_VALUE_SEPARATOR}value_1`,
      `KEY_2${KEY_VALUE_SEPARATOR}`,
    ].join('\n');

    const expectedEnv = {
      KEY_1: 'value_1',
      KEY_2: '',
    };

    readFileSyncSpy.mockReturnValue(fileContent);

    expect(
      parseEnvFile('.env.mock', { override: false, verbose: false }),
    ).toEqual(expectedEnv);
  });

  it('should read no env vars when the env file is empty', () => {
    const fileContent = '';

    const expectedEnv = {};

    readFileSyncSpy.mockReturnValue(fileContent);

    expect(
      parseEnvFile('.env.mock', { override: false, verbose: false }),
    ).toEqual(expectedEnv);
  });

  it('should ignore lines when they are blank or contain only whitespaces', () => {
    const fileContent = [
      '\t',
      `KEY_1${KEY_VALUE_SEPARATOR}value_1`,
      '',
      `KEY_2${KEY_VALUE_SEPARATOR}value_2`,
      '   ',
    ].join('\n');

    const expectedEnv = {
      KEY_1: 'value_1',
      KEY_2: 'value_2',
    };

    readFileSyncSpy.mockReturnValue(fileContent);

    expect(
      parseEnvFile('.env.mock', { override: false, verbose: false }),
    ).toEqual(expectedEnv);
  });

  // Error handling

  it('should throw an error when any key-value pair contains an invalid separator', () => {
    const fileContent = [
      `KEY_1${KEY_VALUE_SEPARATOR}value_1`,
      'KEY_2:value_2',
    ].join('\n');

    readFileSyncSpy.mockReturnValue(fileContent);

    expect(() =>
      parseEnvFile('.env.mock', { override: false, verbose: false }),
    ).toThrow(
      `Error parsing line 2 of ".env.mock": Invalid variable separator, expected "NAME${KEY_VALUE_SEPARATOR}VALUE" format`,
    );
  });

  it('should throw an error when any key is missing from key-value pairs', () => {
    const fileContent = [
      `KEY_1${KEY_VALUE_SEPARATOR}value_1`,
      `${KEY_VALUE_SEPARATOR}value_2`,
    ].join('\n');

    readFileSyncSpy.mockReturnValue(fileContent);

    expect(() =>
      parseEnvFile('.env.mock', { override: false, verbose: false }),
    ).toThrow(
      `Error parsing line 2 of ".env.mock": Variable name not found, expected "NAME${KEY_VALUE_SEPARATOR}VALUE" format`,
    );
  });

  it('should throw an error when any separator is missing from key-value pairs', () => {
    const fileContent = [
      `KEY_1${KEY_VALUE_SEPARATOR}value_1`,
      `KEY_2value_2`,
    ].join('\n');

    readFileSyncSpy.mockReturnValue(fileContent);

    expect(() =>
      parseEnvFile('.env.mock', { override: false, verbose: false }),
    ).toThrow(
      `Error parsing line 2 of ".env.mock": Invalid variable separator, expected "NAME${KEY_VALUE_SEPARATOR}VALUE" format`,
    );
  });

  it('should throw an error when the env file is unreadable', () => {
    readFileSyncSpy.mockImplementation(() => {
      const error: NodeJS.ErrnoException = new Error(
        'No such file or directory',
      );
      error.code = 'ENOENT';
      throw error;
    });

    expect(() =>
      parseEnvFile('.env.mock', { override: false, verbose: false }),
    ).toThrow(/^Error parsing "\.env\.mock": /);
  });

  // Special value handling

  it('should read the value correctly when values are long', () => {
    const fileContent = `KEY_1${KEY_VALUE_SEPARATOR}longvaluehere1234567890abcdefghijklmnopqrstuvwx`;

    const expectedEnv = {
      KEY_1: 'longvaluehere1234567890abcdefghijklmnopqrstuvwx',
    };

    readFileSyncSpy.mockReturnValue(fileContent);

    expect(
      parseEnvFile('.env.mock', { override: false, verbose: false }),
    ).toEqual(expectedEnv);
  });

  it('should read the value correctly when values contain special characters', () => {
    const fileContent = [
      `KEY_1${KEY_VALUE_SEPARATOR}value_1\\nmulti\\line`,
      `KEY_2${KEY_VALUE_SEPARATOR}value_2\\\\path\\\\to\\\\file`,
    ].join('\n');

    const expectedEnv = {
      KEY_1: 'value_1\\nmulti\\line',
      KEY_2: 'value_2\\\\path\\\\to\\\\file',
    };

    readFileSyncSpy.mockReturnValue(fileContent);

    expect(
      parseEnvFile('.env.mock', { override: false, verbose: false }),
    ).toEqual(expectedEnv);
  });

  it('should read all key-value separators as part of the value when multiple separators appear after the first on the same line', () => {
    const fileContent = [
      `KEY_1${KEY_VALUE_SEPARATOR}${KEY_VALUE_SEPARATOR}${KEY_VALUE_SEPARATOR}`,
      `KEY_2${KEY_VALUE_SEPARATOR}value_2${KEY_VALUE_SEPARATOR}value`,
    ].join('\n');

    const expectedEnv = {
      KEY_1: `${KEY_VALUE_SEPARATOR}${KEY_VALUE_SEPARATOR}`,
      KEY_2: `value_2${KEY_VALUE_SEPARATOR}value`,
    };

    readFileSyncSpy.mockReturnValue(fileContent);

    expect(
      parseEnvFile('.env.mock', { override: false, verbose: false }),
    ).toEqual(expectedEnv);
  });

  // Quote handling

  it('should remove the surrounding double quotes from the value when values are enclosed in double quotes', () => {
    const fileContent = [
      `KEY_1${KEY_VALUE_SEPARATOR}"value_1"`,
      `KEY_2${KEY_VALUE_SEPARATOR}"value_2 with spaces"`,
    ].join('\n');

    const expectedEnv = {
      KEY_1: 'value_1',
      KEY_2: 'value_2 with spaces',
    };

    readFileSyncSpy.mockReturnValue(fileContent);

    expect(
      parseEnvFile('.env.mock', { override: false, verbose: false }),
    ).toEqual(expectedEnv);
  });

  it('should read any double quote as part of the value when values start with but do not end with a double quote', () => {
    const fileContent = [
      `KEY_1${KEY_VALUE_SEPARATOR}"value_1`,
      `KEY_2${KEY_VALUE_SEPARATOR}"value_2"value`,
    ].join('\n');

    const expectedEnv = {
      KEY_1: '"value_1',
      KEY_2: '"value_2"value',
    };

    readFileSyncSpy.mockReturnValue(fileContent);

    expect(
      parseEnvFile('.env.mock', { override: false, verbose: false }),
    ).toEqual(expectedEnv);
  });

  it('should read any double quote as part of the value when values do not start with a double quote', () => {
    const fileContent = [
      `KEY_1${KEY_VALUE_SEPARATOR}value_1"`,
      `KEY_2${KEY_VALUE_SEPARATOR}value_2"quoted"`,
      `KEY_3${KEY_VALUE_SEPARATOR}value_3"quoted"value`,
    ].join('\n');

    const expectedEnv = {
      KEY_1: 'value_1"',
      KEY_2: 'value_2"quoted"',
      KEY_3: 'value_3"quoted"value',
    };

    readFileSyncSpy.mockReturnValue(fileContent);

    expect(
      parseEnvFile('.env.mock', { override: false, verbose: false }),
    ).toEqual(expectedEnv);
  });

  it('should remove the surrounding single quotes from the value when values are enclosed in single quotes', () => {
    const fileContent = [
      `KEY_1${KEY_VALUE_SEPARATOR}'value_1'`,
      `KEY_2${KEY_VALUE_SEPARATOR}'value_2 with spaces'`,
    ].join('\n');

    const expectedEnv = {
      KEY_1: 'value_1',
      KEY_2: 'value_2 with spaces',
    };

    readFileSyncSpy.mockReturnValue(fileContent);

    expect(
      parseEnvFile('.env.mock', { override: false, verbose: false }),
    ).toEqual(expectedEnv);
  });

  it('should read any single quote as part of the value when values start with but do not end with a single quote', () => {
    const fileContent = [
      `KEY_1${KEY_VALUE_SEPARATOR}'value_1`,
      `KEY_2${KEY_VALUE_SEPARATOR}'value_2'value`,
    ].join('\n');

    const expectedEnv = {
      KEY_1: "'value_1",
      KEY_2: "'value_2'value",
    };

    readFileSyncSpy.mockReturnValue(fileContent);

    expect(
      parseEnvFile('.env.mock', { override: false, verbose: false }),
    ).toEqual(expectedEnv);
  });

  it('should read any single quote as part of the value when values do not start with a single quote', () => {
    const fileContent = [
      `KEY_1${KEY_VALUE_SEPARATOR}value_1'`,
      `KEY_2${KEY_VALUE_SEPARATOR}value_2'quoted'`,
      `KEY_3${KEY_VALUE_SEPARATOR}value_3'quoted'value`,
    ].join('\n');

    const expectedEnv = {
      KEY_1: "value_1'",
      KEY_2: "value_2'quoted'",
      KEY_3: "value_3'quoted'value",
    };

    readFileSyncSpy.mockReturnValue(fileContent);

    expect(
      parseEnvFile('.env.mock', { override: false, verbose: false }),
    ).toEqual(expectedEnv);
  });

  // Verbose

  describe('if verbose flag is activated', () => {
    let logSpy: jest.SpyInstance;

    beforeAll(() => {
      logSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    afterAll(() => {
      logSpy.mockRestore();
    });

    it('should display all the parsing process details when key-value pairs are well-formed', () => {
      const fileContent = [
        `KEY_1${KEY_VALUE_SEPARATOR}value_1`,
        `KEY_2${KEY_VALUE_SEPARATOR}value_2`,
      ].join('\n');

      readFileSyncSpy.mockReturnValue(fileContent);
      parseEnvFile('.env.mock', { override: false, verbose: true });

      expect(logSpy).toHaveBeenCalledTimes(3);
      expect(logSpy).toHaveBeenNthCalledWith(1, 'Parsing file ".env.mock"');
      expect(logSpy).toHaveBeenNthCalledWith(
        2,
        'Successfully parsed: KEY_1 = value_1',
      );
      expect(logSpy).toHaveBeenNthCalledWith(
        3,
        'Successfully parsed: KEY_2 = value_2',
      );
    });

    it('should display only the filename being parsed when env file is empty', () => {
      const fileContent = '';

      readFileSyncSpy.mockReturnValue(fileContent);
      parseEnvFile('.env.mock', { override: false, verbose: true });

      expect(logSpy).toHaveBeenCalledTimes(1);
      expect(logSpy).toHaveBeenCalledWith('Parsing file ".env.mock"');
    });

    it('should not display anything when the env file is unreadable', () => {
      readFileSyncSpy.mockImplementation(() => {
        const error: NodeJS.ErrnoException = new Error(
          'No such file or directory',
        );
        error.code = 'ENOENT';
        throw error;
      });

      try {
        parseEnvFile('.env.mock', { override: false, verbose: true });
      } catch {
        /* empty */
      }

      expect(logSpy).not.toHaveBeenCalled();
    });

    it('should stop displaying parsing process details when an error occurs in the middle of the process', () => {
      const fileContent = [
        `KEY_1${KEY_VALUE_SEPARATOR}value_1`,
        `KEY_2:value_2`,
      ].join('\n');

      readFileSyncSpy.mockReturnValue(fileContent);
      try {
        parseEnvFile('.env.mock', { override: false, verbose: true });
      } catch {
        /* empty */
      }

      expect(logSpy).toHaveBeenCalledTimes(2);
      expect(logSpy).toHaveBeenNthCalledWith(1, 'Parsing file ".env.mock"');
      expect(logSpy).toHaveBeenNthCalledWith(
        2,
        'Successfully parsed: KEY_1 = value_1',
      );
    });

    it('should not display the surrounding quotes of the env var value when values are enclosed in quotes', () => {
      const fileContent = [
        `KEY_1${KEY_VALUE_SEPARATOR}"value_1"`,
        `KEY_2${KEY_VALUE_SEPARATOR}'value_2'`,
        `KEY_3${KEY_VALUE_SEPARATOR}"value_'3'"`,
        `KEY_4${KEY_VALUE_SEPARATOR}'value_"4"'`,
      ].join('\n');

      readFileSyncSpy.mockReturnValue(fileContent);
      parseEnvFile('.env.mock', { override: false, verbose: true });

      expect(logSpy).toHaveBeenCalledTimes(5);
      expect(logSpy).toHaveBeenNthCalledWith(1, 'Parsing file ".env.mock"');
      expect(logSpy).toHaveBeenNthCalledWith(
        2,
        'Successfully parsed: KEY_1 = value_1',
      );
      expect(logSpy).toHaveBeenNthCalledWith(
        3,
        'Successfully parsed: KEY_2 = value_2',
      );
      expect(logSpy).toHaveBeenNthCalledWith(
        4,
        "Successfully parsed: KEY_3 = value_'3'",
      );
      expect(logSpy).toHaveBeenNthCalledWith(
        5,
        'Successfully parsed: KEY_4 = value_"4"',
      );
    });
  });

  // Override duplicated vars

  it('should keep the original value of env vars when their names are duplicated', () => {
    const fileContent = [
      `KEY_1${KEY_VALUE_SEPARATOR}value_1`,
      `KEY_2${KEY_VALUE_SEPARATOR}value_2`,
      `KEY_1${KEY_VALUE_SEPARATOR}value_3`,
    ].join('\n');

    const expectedEnv = {
      KEY_1: 'value_1',
      KEY_2: 'value_2',
    };

    readFileSyncSpy.mockReturnValue(fileContent);

    expect(
      parseEnvFile('.env.mock', { override: false, verbose: false }),
    ).toEqual(expectedEnv);
  });

  describe('if overrides flag is activated', () => {
    it('should override the value of env vars when their names are duplicated one time', () => {
      const fileContent = [
        `KEY_1${KEY_VALUE_SEPARATOR}value_1a`,
        `KEY_2${KEY_VALUE_SEPARATOR}value_2`,
        `KEY_1${KEY_VALUE_SEPARATOR}value_1b`,
      ].join('\n');

      const expectedEnv = {
        KEY_1: 'value_1b',
        KEY_2: 'value_2',
      };

      readFileSyncSpy.mockReturnValue(fileContent);

      expect(
        parseEnvFile('.env.mock', { override: true, verbose: false }),
      ).toEqual(expectedEnv);
    });
  });
});
