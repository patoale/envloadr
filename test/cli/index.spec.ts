import { run } from '@/cli';
import { buildHelp } from '@/cli/help';
import schema from '@/cli/schema';
import * as envFile from '@/envFile';
import childProcess from 'child_process';

describe('run', () => {
  const originalArgv = process.argv;

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
    const parseEnvFilesSpy = jest
      .spyOn(envFile, 'parseEnvFile')
      .mockImplementation();
    const spawnSpy = jest.spyOn(childProcess, 'spawn').mockImplementation();

    process.argv = ['node', 'envloadr', '-h', 'node', 'start.js'];

    try {
      run();

      expect(parseEnvFilesSpy).not.toHaveBeenCalled();
      expect(spawnSpy).not.toHaveBeenCalled();
    } finally {
      spawnSpy.mockRestore();
      parseEnvFilesSpy.mockRestore();
    }
  });
});
