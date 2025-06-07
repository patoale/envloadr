import childProcess from 'child_process';
import {
  DEFAULT_ENV_FILE_PATH,
  DEFAULT_OVERRIDE,
  DEFAULT_VERBOSE,
} from '@/config';
import { run } from '@/cli';
import { buildHelp } from '@/cli/help';
import * as cliParser from '@/cli/parser';
import schema from '@/cli/schema';
import * as envFile from '@/envFile';
import type { Args, SpecSchema } from '@/cli/parser/types';

describe('run', () => {
  let cliParseSpy: jest.SpyInstance<
    Args<SpecSchema>,
    [input: string[], schema: SpecSchema]
  >;
  let parseEnvFilesSpy: jest.SpyInstance;
  let spawnSpy: jest.SpyInstance;

  beforeAll(() => {
    // Testing these functions is not the objective of this suite,
    // so they can be mocked throughout the process
    cliParseSpy = jest.spyOn(cliParser, 'parse');
    parseEnvFilesSpy = jest
      .spyOn(envFile, 'parseEnvFiles')
      .mockImplementation();
    spawnSpy = jest.spyOn(childProcess, 'spawn').mockImplementation();
  });

  afterAll(() => {
    cliParseSpy.mockRestore();
    parseEnvFilesSpy.mockRestore();
    spawnSpy.mockRestore();
  });

  it('should print help message when help option is enabled', () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    try {
      const expectedHelpMessage = buildHelp(schema);

      cliParseSpy.mockReturnValueOnce({
        command: { name: 'node', args: ['start.js'] },
        options: { help: true },
      });

      run();

      expect(consoleLogSpy).toHaveBeenCalledWith(expectedHelpMessage);
    } finally {
      consoleLogSpy.mockRestore();
    }
  });

  it('should stop execution after printing help message when help option is enabled', () => {
    cliParseSpy.mockReturnValueOnce({
      command: { name: 'node', args: ['start.js'] },
      options: { help: true },
    });

    run();

    expect(parseEnvFilesSpy).not.toHaveBeenCalled();
    expect(spawnSpy).not.toHaveBeenCalled();
  });

  it(`should load env vars from ${DEFAULT_ENV_FILE_PATH} when the input does not include the file option`, () => {
    const expectedPathnames = [DEFAULT_ENV_FILE_PATH];
    const expectedOptions = { override: false, verbose: true };

    cliParseSpy.mockReturnValueOnce({
      command: { name: 'node', args: ['start.js'] },
      options: { noOverride: true, verbose: true },
    });

    run();

    expect(parseEnvFilesSpy).toHaveBeenCalledWith(
      expectedPathnames,
      expectedOptions,
    );
  });

  it(`should use override=${DEFAULT_OVERRIDE} when the input does not include the override option`, () => {
    const expectedPathnames = ['.env'];
    const expectedOptions = { override: DEFAULT_OVERRIDE, verbose: true };

    cliParseSpy.mockReturnValueOnce({
      command: { name: 'node', args: ['start.js'] },
      options: { files: ['.env'], verbose: true },
    });

    run();

    expect(parseEnvFilesSpy).toHaveBeenCalledWith(
      expectedPathnames,
      expectedOptions,
    );
  });

  it(`should use verbose=${DEFAULT_VERBOSE} when the input does not include the verbose option`, () => {
    const expectedPathnames = ['.env'];
    const expectedOptions = { override: false, verbose: DEFAULT_VERBOSE };

    cliParseSpy.mockReturnValueOnce({
      command: { name: 'node', args: ['start.js'] },
      options: { files: ['.env'], noOverride: true },
    });

    run();

    expect(parseEnvFilesSpy).toHaveBeenCalledWith(
      expectedPathnames,
      expectedOptions,
    );
  });

  it(`should use the default values for options when the input does not contain any options`, () => {
    const expectedPathnames = [DEFAULT_ENV_FILE_PATH];
    const expectedOptions = {
      override: DEFAULT_OVERRIDE,
      verbose: DEFAULT_VERBOSE,
    };

    cliParseSpy.mockReturnValueOnce({
      command: { name: 'node', args: ['start.js'] },
    });

    run();

    expect(parseEnvFilesSpy).toHaveBeenCalledWith(
      expectedPathnames,
      expectedOptions,
    );
  });
});
