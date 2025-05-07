import { CLI_FLAG_LONG_PREFIX, CLI_FLAG_SHORT_PREFIX } from '@/config';
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
    const input = [`${CLI_FLAG_LONG_PREFIX}flagA`, 'command-target'];
    const expectedOptions = {
      flagA: true,
    };

    expect(parse(input, schema).options).toEqual(expectedOptions);
  });

  it('should return the correct options when the input contains multiple options', () => {
    const input = [
      `${CLI_FLAG_LONG_PREFIX}flagA`,
      `${CLI_FLAG_LONG_PREFIX}flagB=valueB`,
      `${CLI_FLAG_LONG_PREFIX}flagC=valueC`,
      'command-target',
    ];
    const expectedOptions = {
      flagA: true,
      flagB: ['valueB'],
      flagC: 'valueC',
    };

    expect(parse(input, schema).options).toEqual(expectedOptions);
  });

  it('should return the same options for different inputs when both contain the same options, but in a different order', () => {
    const inputA = [
      `${CLI_FLAG_LONG_PREFIX}flagA`,
      `${CLI_FLAG_LONG_PREFIX}flagC=value`,
      'command-target',
    ];
    const inputB = [
      `${CLI_FLAG_LONG_PREFIX}flagC=value`,
      `${CLI_FLAG_LONG_PREFIX}flagA`,
      'command-target',
    ];
    const expectedOptions = {
      flagA: true,
      flagC: 'value',
    };

    const { options: resultOptionsA } = parse(inputA, schema);
    const { options: resultOptionsB } = parse(inputB, schema);

    expect(resultOptionsA).toEqual(resultOptionsB);
    expect(resultOptionsA).toEqual(expectedOptions);
  });

  it('should return the same options for different inputs when one uses long flags and the other uses short flags', () => {
    const inputA = [
      `${CLI_FLAG_LONG_PREFIX}flagA`,
      `${CLI_FLAG_LONG_PREFIX}flagB=value`,
      'command-target',
    ];
    const inputB = [
      `${CLI_FLAG_SHORT_PREFIX}fa`,
      `${CLI_FLAG_SHORT_PREFIX}fb=value`,
      'command-target',
    ];
    const expectedOptions = {
      flagA: true,
      flagB: ['value'],
    };

    const { options: resultOptionsA } = parse(inputA, schema);
    const { options: resultOptionsB } = parse(inputB, schema);

    expect(resultOptionsA).toEqual(resultOptionsB);
    expect(resultOptionsA).toEqual(expectedOptions);
  });

  it('should return the correct options when the input mixes long and short flags', () => {
    const input = [
      '-fa',
      `${CLI_FLAG_LONG_PREFIX}flagC=value`,
      'command-target',
    ];
    const expectedOptions = {
      flagA: true,
      flagC: 'value',
    };

    expect(parse(input, schema).options).toEqual(expectedOptions);
  });

  it('should throw an error when the input contains an unknown flag', () => {
    const unknownFlag = 'flagZ';
    const input = [
      '-fa',
      `${CLI_FLAG_LONG_PREFIX}${unknownFlag}`,
      'command-target',
    ];

    expect(() => parse(input, schema)).toThrow(
      `Error parsing CLI input: Unknown option "${unknownFlag}"`,
    );
  });

  it('should treat an option as the target command when the option has no flag prefix', () => {
    const input = [
      `${CLI_FLAG_SHORT_PREFIX}fa`,
      'flagB=valueB',
      `${CLI_FLAG_LONG_PREFIX}flagC=valueC`,
      'command-target',
    ];
    const expectedArgs = {
      command: {
        name: 'flagB=valueB',
        args: [`${CLI_FLAG_LONG_PREFIX}flagC=valueC`, 'command-target'],
      },
      options: {
        flagA: true,
      },
    };

    expect(parse(input, schema)).toEqual(expectedArgs);
  });

  it('should treat an option as the target command when the option has an invalid flag prefix', () => {
    const input = [
      `${CLI_FLAG_SHORT_PREFIX}fa`,
      '++flagB=valueB',
      `${CLI_FLAG_LONG_PREFIX}flagC=valueC`,
      'command-target',
    ];
    const expectedArgs = {
      command: {
        name: '++flagB=valueB',
        args: [`${CLI_FLAG_LONG_PREFIX}flagC=valueC`, 'command-target'],
      },
      options: {
        flagA: true,
      },
    };

    expect(parse(input, schema)).toEqual(expectedArgs);
  });

  it('should throw an error when the option requires a value but it is missing', () => {
    const noValuedFlag = 'flagC';
    const input = [`${CLI_FLAG_LONG_PREFIX}${noValuedFlag}`, 'command-target'];

    expect(() => parse(input, schema)).toThrow(
      `Error parsing CLI input: Expected value for option "${noValuedFlag}"`,
    );
  });

  it('should throw an error when a non-valuable option has a value', () => {
    const valuedFlag = 'help';
    const input = [
      `${CLI_FLAG_LONG_PREFIX}${valuedFlag}=value`,
      'command-target',
    ];

    expect(() => parse(input, schema)).toThrow(
      `Error parsing CLI input: Unexpected value for option "${valuedFlag}"`,
    );
  });
});
