import { parse } from '@/cli/parser';

const schema = {
  flagA: {
    description: 'Option A',
    longFlag: 'flagA',
    shortFlag: 'fa',
    type: {
      isArray: false,
      primitiveType: 'boolean',
    },
  },
  flagB: {
    description: 'Option B',
    longFlag: 'flagB',
    shortFlag: 'fb',
    type: {
      isArray: true,
      primitiveType: 'string',
    },
  },
  flagC: {
    description: 'Option C',
    longFlag: 'flagC',
    type: {
      isArray: false,
      primitiveType: 'string',
    },
  },
  help: {
    description: 'Help option',
    longFlag: 'help',
    shortFlag: 'h',
  },
} as const;

describe('parse', () => {
  it('should throw an error when the input does not contain the target command', () => {
    const input: string[] = [];

    expect(() => parse(input, schema)).toThrow(
      'Error parsing CLI input: Missing target command',
    );
  });

  it('should return an empty list of target command args when the input contains the target command without any args', () => {
    const input = ['command-target'];

    expect(parse(input, schema).command.args).toHaveLength(0);
  });

  it('should return a list with the target command args when the input includes the target command with args', () => {
    const input = [
      'target-command',
      'target-command-arg1',
      'target-command-arg2',
      'target-command-arg3',
    ];
    const expectedCommandArgs = [
      'target-command-arg1',
      'target-command-arg2',
      'target-command-arg3',
    ];

    expect(parse(input, schema).command.args).toEqual(expectedCommandArgs);
  });

  it('should not return any option when the input does not contain any option', () => {
    const input = ['target-command'];

    expect(parse(input, schema).options).toBeUndefined();
  });

  it('should return the correct option when the input contains only one option', () => {
    const input = ['--flagA', 'command-target'];
    const expectedOptions = {
      flagA: true,
    };

    expect(parse(input, schema).options).toEqual(expectedOptions);
  });

  it('should return the correct options when the input contains multiple options', () => {
    const input = [
      '--flagA',
      '--flagB=valueB',
      '--flagC=valueC',
      'command-target',
    ];
    const expectedOptions = {
      flagA: true,
      flagB: ['valueB'],
      flagC: 'valueC',
    };

    expect(parse(input, schema).options).toEqual(expectedOptions);
  });
});
