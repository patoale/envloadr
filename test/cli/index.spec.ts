import childProcess from 'child_process';
import { DEFAULT_ENV_FILE_PATH, DEFAULT_OVERRIDE } from '@/config';
import { run } from '@/cli';
import { buildHelp } from '@/cli/help';
import schema from '@/cli/schema';
import * as envFile from '@/envFile';

describe('run', () => {
  const originalArgv = process.argv;
  let parseEnvFilesSpy: jest.SpyInstance;
  let spawnSpy: jest.SpyInstance;

  beforeAll(() => {
    // Testing these functions is not the objective of this suite,
    // so they can be mocked throughout the process
    parseEnvFilesSpy = jest
      .spyOn(envFile, 'parseEnvFiles')
      .mockImplementation();
    spawnSpy = jest.spyOn(childProcess, 'spawn').mockImplementation();
  });

  afterAll(() => {
    parseEnvFilesSpy.mockRestore();
    spawnSpy.mockRestore();
  });

  afterEach(() => {
    process.argv = originalArgv;
  });

  it('should print help message when help option is enabled', () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    process.argv = ['node', 'envloadr', '-h', 'node', 'start.js'];

    try {
      const expectedHelpMessage = buildHelp(schema);

      run();

      expect(console.log).toHaveBeenCalledWith(expectedHelpMessage);
    } finally {
      consoleLogSpy.mockRestore();
    }
  });

  it('should stop execution after printing help message when help option is enabled', () => {
    process.argv = ['node', 'envloadr', '-h', 'node', 'start.js'];

    run();

    expect(parseEnvFilesSpy).not.toHaveBeenCalled();
    expect(spawnSpy).not.toHaveBeenCalled();
  });

  it(`should load env vars from ${DEFAULT_ENV_FILE_PATH} when the input does not include the file option`, () => {
    process.argv = [
      'node',
      'envloadr',
      '--no-override',
      '-v',
      'node',
      'start.js',
    ];

    const expectedPathnames = [DEFAULT_ENV_FILE_PATH];
    const expectedOptions = { override: false, verbose: true };

    run();

    expect(parseEnvFilesSpy).toHaveBeenCalledWith(
      expectedPathnames,
      expectedOptions,
    );
  });

  it(`should use override=${DEFAULT_OVERRIDE} when the input does not include the override option`, () => {
    process.argv = ['node', 'envloadr', '-f=.env', '-v', 'node', 'start.js'];

    const expectedPathnames = ['.env'];
    const expectedOptions = { override: DEFAULT_OVERRIDE, verbose: true };

    run();

    expect(parseEnvFilesSpy).toHaveBeenCalledWith(
      expectedPathnames,
      expectedOptions,
    );
  });
});
