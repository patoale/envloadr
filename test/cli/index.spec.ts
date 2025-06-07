import childProcess from 'child_process';
import {
  CLI_FLAG_LONG_PREFIX,
  CLI_FLAG_VALUE_SEPARATOR,
  DEFAULT_ENV_FILE_PATH,
  DEFAULT_OVERRIDE,
  DEFAULT_VERBOSE,
} from '@/config';
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

    process.argv = [
      'node',
      'envloadr',
      `${CLI_FLAG_LONG_PREFIX}${schema.help.longFlag}`,
      'node',
      'start.js',
    ];

    try {
      const expectedHelpMessage = buildHelp(schema);

      run();

      expect(consoleLogSpy).toHaveBeenCalledWith(expectedHelpMessage);
    } finally {
      consoleLogSpy.mockRestore();
    }
  });

  it('should stop execution after printing help message when help option is enabled', () => {
    process.argv = [
      'node',
      'envloadr',
      `${CLI_FLAG_LONG_PREFIX}${schema.help.longFlag}`,
      'node',
      'start.js',
    ];

    run();

    expect(parseEnvFilesSpy).not.toHaveBeenCalled();
    expect(spawnSpy).not.toHaveBeenCalled();
  });

  it(`should load env vars from ${DEFAULT_ENV_FILE_PATH} when the input does not include the file option`, () => {
    process.argv = [
      'node',
      'envloadr',
      `${CLI_FLAG_LONG_PREFIX}${schema.noOverride.longFlag}`,
      `${CLI_FLAG_LONG_PREFIX}${schema.verbose.longFlag}`,
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
    process.argv = [
      'node',
      'envloadr',
      `${CLI_FLAG_LONG_PREFIX}${schema.files.longFlag}${CLI_FLAG_VALUE_SEPARATOR}.env`,
      `${CLI_FLAG_LONG_PREFIX}${schema.verbose.longFlag}`,
      'node',
      'start.js',
    ];

    const expectedPathnames = ['.env'];
    const expectedOptions = { override: DEFAULT_OVERRIDE, verbose: true };

    run();

    expect(parseEnvFilesSpy).toHaveBeenCalledWith(
      expectedPathnames,
      expectedOptions,
    );
  });

  it(`should use verbose=${DEFAULT_VERBOSE} when the input does not include the verbose option`, () => {
    process.argv = [
      'node',
      'envloadr',
      `${CLI_FLAG_LONG_PREFIX}${schema.files.longFlag}${CLI_FLAG_VALUE_SEPARATOR}.env`,
      `${CLI_FLAG_LONG_PREFIX}${schema.noOverride.longFlag}`,
      'node',
      'start.js',
    ];

    const expectedPathnames = ['.env'];
    const expectedOptions = { override: false, verbose: DEFAULT_VERBOSE };

    run();

    expect(parseEnvFilesSpy).toHaveBeenCalledWith(
      expectedPathnames,
      expectedOptions,
    );
  });

  it(`should use the default values for options when the input does not contain any options`, () => {
    process.argv = ['node', 'envloadr', 'node', 'start.js'];

    const expectedPathnames = [DEFAULT_ENV_FILE_PATH];
    const expectedOptions = {
      override: DEFAULT_OVERRIDE,
      verbose: DEFAULT_VERBOSE,
    };

    run();

    expect(parseEnvFilesSpy).toHaveBeenCalledWith(
      expectedPathnames,
      expectedOptions,
    );
  });
});
