import { run } from '@/cli';
import { buildHelp } from '@/cli/help';
import schema from '@/cli/schema';
import * as envFile from '@/envFile';
import childProcess from 'child_process';

describe('run', () => {
  it('should print help message when help option is enabled', () => {
    const originalArgv = process.argv;
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    process.argv = ['node', 'envloadr', '-h', 'node', 'start.js'];

    try {
      const expectedHelpMessage = buildHelp(schema);

      run();

      expect(console.log).toHaveBeenCalledWith(expectedHelpMessage);
    } finally {
      consoleLogSpy.mockRestore();
      process.argv = originalArgv;
    }
  });

  it('should stop execution after printing help message when help option is enabled', () => {
    const originalArgv = process.argv;
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
      process.argv = originalArgv;
    }
  });
});
