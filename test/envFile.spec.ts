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

  it('should read env vars correctly when exists spaces around the key-value separator', () => {
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

  it('should read the value of env vars correctly when it contains spaces', () => {
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

  it('should throw an error when key-value pairs contain an invalid separator', () => {
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

  it('should read the value of env vars as an empty string when it is missing', () => {
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

  it('should read the value of env vars correctly when it is long', () => {
    const fileContent = `LONG_KEY${KEY_VALUE_SEPARATOR}longvaluehere1234567890abcdefghijklmnopqrstuvwx`;

    const expectedEnv = {
      LONG_KEY: 'longvaluehere1234567890abcdefghijklmnopqrstuvwx',
    };

    readFileSyncSpy.mockReturnValue(fileContent);

    expect(parseEnvFile('.env.mock', false)).toEqual(expectedEnv);
  });

  it('should read the value of env vars correctly when it contains special characters', () => {
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

  it('should throw an error when the key is missing in key-value pair', () => {
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

  it('should throw an error when the separator is missing in key-value pair', () => {
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

  it('should read key-value separators after the first as part of the value when multiple exist in a line', () => {
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

  it('should remove the surrounding double quotes from the env var value when it is enclosed in double quotes', () => {
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

  it('should read any double quote as part of the env var value when the value does not ends with a double quote', () => {
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

  it('should read any double quote as part of the env var value when the value does not starts with a double quote', () => {
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
});
