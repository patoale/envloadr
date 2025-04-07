import fs from 'fs';
import { KEY_VALUE_SEPARATOR } from '@/config';
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
});
