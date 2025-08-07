import { syncEvents } from '@/cli/utils/childProcess';

import { ChildProcess } from 'child_process';
import { EventEmitter } from 'events';

describe('syncEvents', () => {
  const mockParentExit = jest.fn();

  let child: ChildProcess;
  let parent: NodeJS.Process;

  beforeEach(() => {
    parent = Object.assign(new EventEmitter(), {
      exit: mockParentExit,
    }) as unknown as NodeJS.Process;

    child = new EventEmitter() as ChildProcess;
  });

  it("should exit parent process with child's exit code when child exits normally", () => {
    syncEvents(parent, child);

    child.emit('exit', 0, null);

    expect(mockParentExit).toHaveBeenCalledWith(0);
  });
});
