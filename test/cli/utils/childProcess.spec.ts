import { syncEvents } from '@/cli/utils/childProcess';

import { ChildProcess } from 'child_process';
import { EventEmitter } from 'events';

describe('syncEvents', () => {
  const mockParentExit = jest.fn();
  const mockParentKill = jest.fn();

  let child: ChildProcess;
  let parent: NodeJS.Process;

  beforeEach(() => {
    parent = Object.assign(new EventEmitter(), {
      exit: mockParentExit,
      kill: mockParentKill,
    }) as unknown as NodeJS.Process;

    child = Object.assign(new EventEmitter(), {
      spawnargs: ['node', 'example.js'],
    }) as unknown as ChildProcess;
  });

  it("should exit parent process with child's exit code when child exits normally", () => {
    syncEvents(parent, child);

    child.emit('exit', 0, null);

    expect(mockParentExit).toHaveBeenCalledWith(0);
  });

  it('should exit parent process with code 1 when child exits with null code', () => {
    syncEvents(parent, child);

    child.emit('exit', null, null);

    expect(mockParentExit).toHaveBeenCalledWith(1);
  });

  it('should terminate parent process with same signal when child is killed by signal', () => {
    syncEvents(parent, child);

    child.emit('exit', null, 'SIGTERM');

    expect(mockParentKill).toHaveBeenCalledWith(parent.pid, 'SIGTERM');
  });

  it('should log error when child fails to launch', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    try {
      syncEvents(parent, child);

      child.emit('error', new Error('Launch failed'));

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Command "node example.js" failed to launch: Launch failed',
      );
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });
});
