import { buildHelp } from '@/cli/help';

describe('buildHelp', () => {
  it('should return only the tool usage without any options when the options schema is empty', () => {
    const schema = {};
    const expectedhelp =
      'Usage: envloadr [<options>] <target-command> [<args>]';

    expect(buildHelp(schema)).toBe(expectedhelp);
  });
});
