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
    const envVars = {
      KEY: 'value',
      DATABASE: 'production',
      API_KEY: '12345',
    };

    readFileSyncSpy.mockReturnValue(
      Object.entries(envVars)
        .map(([key, value]) => `${key}${KEY_VALUE_SEPARATOR}${value}`)
        .join('\n'),
    );

    expect(parseEnvFile('.env.mock', false)).toEqual(envVars);
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
      `KEY${KEY_VALUE_SEPARATOR}"value with spaces"`,
      `DATABASE${KEY_VALUE_SEPARATOR}'prod environment'`,
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

  it('should read no env vars when the .env file is empty', () => {
    const fileContent = '';

    const expectedEnv = {};

    readFileSyncSpy.mockReturnValue(fileContent);

    expect(parseEnvFile('.env.mock', false)).toEqual(expectedEnv);
  });
});
