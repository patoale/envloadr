import { run } from '@/cli';
import { buildHelp } from '@/cli/help';
import schema from '@/cli/schema';

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
});
