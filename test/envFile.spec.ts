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
      `KEY${KEY_VALUE_SEPARATOR}value`,
      `DATABASE${KEY_VALUE_SEPARATOR}production`,
      `API_KEY${KEY_VALUE_SEPARATOR}12345`,
    ].join('\n');

    const expectedEnv = {
      KEY: 'value',
      DATABASE: 'production',
      API_KEY: '12345',
    };

    readFileSyncSpy.mockReturnValue(fileContent);

    expect(parseEnvFile('.env.mock', false)).toEqual(expectedEnv);
  });

  it('should read env vars correctly when exists spaces around the key-value separators', () => {
    const fileContent = [
      `KEY ${KEY_VALUE_SEPARATOR} value`,
      `DATABASE  ${KEY_VALUE_SEPARATOR}  production`,
    ].join('\n');

    const expectedEnv = {
      KEY: 'value',
      DATABASE: 'production',
    };

    readFileSyncSpy.mockReturnValue(fileContent);

    expect(parseEnvFile('.env.mock', false)).toEqual(expectedEnv);
  });

  it('should read the value correctly when values contain spaces', () => {
    const fileContent = [
      `KEY${KEY_VALUE_SEPARATOR}value with spaces`,
      `DATABASE${KEY_VALUE_SEPARATOR}prod environment`,
    ].join('\n');

    const expectedEnv = {
      KEY: 'value with spaces',
      DATABASE: 'prod environment',
    };

    readFileSyncSpy.mockReturnValue(fileContent);

    expect(parseEnvFile('.env.mock', false)).toEqual(expectedEnv);
  });

  it(`should ignore lines when they start with ${ENV_FILE_COMMENT_PREFIX}`, () => {
    const fileContent = [
      `${ENV_FILE_COMMENT_PREFIX} This is a comment`,
      `KEY${KEY_VALUE_SEPARATOR}value`,
      `DATABASE${KEY_VALUE_SEPARATOR}production`,
      `${ENV_FILE_COMMENT_PREFIX} Another comment`,
    ].join('\n');

    const expectedEnv = {
      KEY: 'value',
      DATABASE: 'production',
    };

    readFileSyncSpy.mockReturnValue(fileContent);

    expect(parseEnvFile('.env.mock', false)).toEqual(expectedEnv);
  });

  it('should read the value as an empty string when the value is missing from key-value pairs', () => {
    const fileContent = [
      `KEY${KEY_VALUE_SEPARATOR}value`,
      `DATABASE${KEY_VALUE_SEPARATOR}`,
    ].join('\n');

    const expectedEnv = {
      KEY: 'value',
      DATABASE: '',
    };

    readFileSyncSpy.mockReturnValue(fileContent);

    expect(parseEnvFile('.env.mock', false)).toEqual(expectedEnv);
  });

  it('should read no env vars when the env file is empty', () => {
    const fileContent = '';

    const expectedEnv = {};

    readFileSyncSpy.mockReturnValue(fileContent);

    expect(parseEnvFile('.env.mock', false)).toEqual(expectedEnv);
  });

  it('should ignore lines when they are blank or contain only whitespaces', () => {
    const fileContent = [
      '\t',
      `KEY${KEY_VALUE_SEPARATOR}value`,
      '',
      `DATABASE${KEY_VALUE_SEPARATOR}production`,
      '   ',
    ].join('\n');

    const expectedEnv = {
      KEY: 'value',
      DATABASE: 'production',
    };

    readFileSyncSpy.mockReturnValue(fileContent);

    expect(parseEnvFile('.env.mock', false)).toEqual(expectedEnv);
  });

  // Error handling

  it('should throw an error when any key-value pair contains an invalid separator', () => {
    const fileContent = [
      `KEY${KEY_VALUE_SEPARATOR}value`,
      'DATABASE:value',
    ].join('\n');

    readFileSyncSpy.mockReturnValue(fileContent);

    expect(() => {
      parseEnvFile('.env.mock', false);
    }).toThrow(
      `Error parsing line 2 of ".env.mock": Invalid variable separator, expected "NAME${KEY_VALUE_SEPARATOR}VALUE" format`,
    );
  });

  it('should throw an error when any key is missing from key-value pairs', () => {
    const fileContent = [
      `KEY${KEY_VALUE_SEPARATOR}value`,
      `${KEY_VALUE_SEPARATOR}value`,
    ].join('\n');

    readFileSyncSpy.mockReturnValue(fileContent);

    expect(() => {
      parseEnvFile('.env.mock', false);
    }).toThrow(
      `Error parsing line 2 of ".env.mock": Variable name not found, expected "NAME${KEY_VALUE_SEPARATOR}VALUE" format`,
    );
  });

  it('should throw an error when any separator is missing from key-value pairs', () => {
    const fileContent = [
      `KEY${KEY_VALUE_SEPARATOR}value`,
      `DATABASEproduction`,
    ].join('\n');

    readFileSyncSpy.mockReturnValue(fileContent);

    expect(() => {
      parseEnvFile('.env.mock', false);
    }).toThrow(
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

    expect(() => {
      parseEnvFile('.env.mock', false);
    }).toThrow(/^Error parsing "\.env\.mock": /);
  });

  // Special value handling

  it('should read the value correctly when values are long', () => {
    const fileContent = `LONG_KEY${KEY_VALUE_SEPARATOR}longvaluehere1234567890abcdefghijklmnopqrstuvwx`;

    const expectedEnv = {
      LONG_KEY: 'longvaluehere1234567890abcdefghijklmnopqrstuvwx',
    };

    readFileSyncSpy.mockReturnValue(fileContent);

    expect(parseEnvFile('.env.mock', false)).toEqual(expectedEnv);
  });

  it('should read the value correctly when values contain special characters', () => {
    const fileContent = [
      `KEY${KEY_VALUE_SEPARATOR}multi\\nline\\value`,
      `DATABASE${KEY_VALUE_SEPARATOR}path\\\\to\\\\file`,
    ].join('\n');

    const expectedEnv = {
      KEY: 'multi\\nline\\value',
      DATABASE: 'path\\\\to\\\\file',
    };

    readFileSyncSpy.mockReturnValue(fileContent);

    expect(parseEnvFile('.env.mock', false)).toEqual(expectedEnv);
  });

  it('should read all key-value separators as part of the value when multiple separators appear after the first on the same line', () => {
    const fileContent = [
      `SEPARATOR${KEY_VALUE_SEPARATOR}${KEY_VALUE_SEPARATOR}${KEY_VALUE_SEPARATOR}`,
      `SERVER_LOG${KEY_VALUE_SEPARATOR}https://localhost:8080/logs?level${KEY_VALUE_SEPARATOR}info`,
    ].join('\n');

    const expectedEnv = {
      SEPARATOR: `${KEY_VALUE_SEPARATOR}${KEY_VALUE_SEPARATOR}`,
      SERVER_LOG: `https://localhost:8080/logs?level${KEY_VALUE_SEPARATOR}info`,
    };

    readFileSyncSpy.mockReturnValue(fileContent);

    expect(parseEnvFile('.env.mock', false)).toEqual(expectedEnv);
  });

  // Quote handling

  it('should remove the surrounding double quotes from the value when values are enclosed in double quotes', () => {
    const fileContent = [
      `KEY${KEY_VALUE_SEPARATOR}"value with spaces"`,
      `DATABASE${KEY_VALUE_SEPARATOR}"production"`,
    ].join('\n');

    const expectedEnv = {
      KEY: 'value with spaces',
      DATABASE: 'production',
    };

    readFileSyncSpy.mockReturnValue(fileContent);

    expect(parseEnvFile('.env.mock', false)).toEqual(expectedEnv);
  });

  it('should read any double quote as part of the value when values start with but do not end with a double quote', () => {
    const fileContent = [
      `KEY${KEY_VALUE_SEPARATOR}"value with spaces`,
      `DATABASE${KEY_VALUE_SEPARATOR}"path to"/data`,
    ].join('\n');

    const expectedEnv = {
      KEY: '"value with spaces',
      DATABASE: '"path to"/data',
    };

    readFileSyncSpy.mockReturnValue(fileContent);

    expect(parseEnvFile('.env.mock', false)).toEqual(expectedEnv);
  });

  it('should read any double quote as part of the value when values do not start with a double quote', () => {
    const fileContent = [
      `KEY${KEY_VALUE_SEPARATOR}value with spaces"`,
      `DATABASE${KEY_VALUE_SEPARATOR}path/to/"my data"`,
      `API_KEY${KEY_VALUE_SEPARATOR}1234"5"6789`,
    ].join('\n');

    const expectedEnv = {
      KEY: 'value with spaces"',
      DATABASE: 'path/to/"my data"',
      API_KEY: '1234"5"6789',
    };

    readFileSyncSpy.mockReturnValue(fileContent);

    expect(parseEnvFile('.env.mock', false)).toEqual(expectedEnv);
  });

  it('should remove the surrounding single quotes from the value when values are enclosed in single quotes', () => {
    const fileContent = [
      `KEY${KEY_VALUE_SEPARATOR}'value with spaces'`,
      `DATABASE${KEY_VALUE_SEPARATOR}'production'`,
    ].join('\n');

    const expectedEnv = {
      KEY: 'value with spaces',
      DATABASE: 'production',
    };

    readFileSyncSpy.mockReturnValue(fileContent);

    expect(parseEnvFile('.env.mock', false)).toEqual(expectedEnv);
  });

  it('should read any single quote as part of the value when values start with but do not end with a single quote', () => {
    const fileContent = [
      `KEY${KEY_VALUE_SEPARATOR}'value with spaces`,
      `DATABASE${KEY_VALUE_SEPARATOR}'path to'/data`,
    ].join('\n');

    const expectedEnv = {
      KEY: "'value with spaces",
      DATABASE: "'path to'/data",
    };

    readFileSyncSpy.mockReturnValue(fileContent);

    expect(parseEnvFile('.env.mock', false)).toEqual(expectedEnv);
  });

  it('should read any single quote as part of the value when values do not start with a single quote', () => {
    const fileContent = [
      `KEY${KEY_VALUE_SEPARATOR}value with spaces'`,
      `DATABASE${KEY_VALUE_SEPARATOR}path/to/'my data'`,
      `API_KEY${KEY_VALUE_SEPARATOR}1234'5'6789`,
    ].join('\n');

    const expectedEnv = {
      KEY: "value with spaces'",
      DATABASE: "path/to/'my data'",
      API_KEY: "1234'5'6789",
    };

    readFileSyncSpy.mockReturnValue(fileContent);

    expect(parseEnvFile('.env.mock', false)).toEqual(expectedEnv);
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
      parseEnvFile('.env.mock', true);

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
      parseEnvFile('.env.mock', true);

      expect(logSpy).toHaveBeenCalledTimes(1);
      expect(logSpy).toHaveBeenCalledWith('Parsing file ".env.mock"');
    });
  });
});
