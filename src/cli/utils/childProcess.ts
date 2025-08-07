import { ChildProcess } from 'child_process';

const SIGNALS: NodeJS.Signals[] = ['SIGINT', 'SIGTERM', 'SIGHUP'];

type SignalListener = {
  signal: NodeJS.Signals;
  listener: () => boolean;
};

function propagateExit(
  sourceProcess: ChildProcess,
  targetProcess: NodeJS.Process,
  cleanupListeners: SignalListener[],
) {
  sourceProcess.on('exit', (code, signal) => {
    cleanupListeners.forEach(({ signal, listener }) =>
      targetProcess.removeListener(signal, listener),
    );

    if (signal !== null) targetProcess.kill(targetProcess.pid, signal);
    else targetProcess.exit(code ?? 1);
  });

  sourceProcess.on('error', (err) => {
    console.error(
      `Command "${sourceProcess.spawnargs.join(' ')}" failed to launch: ${err.message}`,
    );

    targetProcess.exit(1);
  });
}

function propagateSignals(
  sourceProcess: NodeJS.Process,
  targetProcess: ChildProcess,
) {
  const listeners = SIGNALS.map((signal) => ({
    signal,
    listener: () => targetProcess.kill(signal),
  }));

  listeners.forEach(({ listener, signal }) =>
    sourceProcess.on(signal, listener),
  );

  return listeners;
}

export function syncEvents(parent: NodeJS.Process, child: ChildProcess): void {
  const removeListeners = propagateSignals(parent, child);
  propagateExit(child, parent, removeListeners);
}
