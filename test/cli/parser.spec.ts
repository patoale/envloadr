import {
  CLI_FLAG_LONG_PREFIX,
  CLI_FLAG_SHORT_PREFIX,
  CLI_FLAG_VALUE_SEPARATOR,
  CLI_OPTION_VALUES_SEPARATOR,
} from '@/config';
import { parse } from '@/cli/parser';

const schema = {
  flagA: {
    description: 'Option A',
    longFlag: 'flagA',
    shortFlag: 'fa',
    type: 'boolean',
  },
  flagB: {
    description: 'Option B',
    longFlag: 'flagB',
    shortFlag: 'fb',
    type: 'stringArray',
  },
  flagC: {
    description: 'Option C',
    longFlag: 'flagC',
    type: 'string',
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
      `${CLI_FLAG_LONG_PREFIX}flagB${CLI_FLAG_VALUE_SEPARATOR}valueB`,
      `${CLI_FLAG_LONG_PREFIX}flagC${CLI_FLAG_VALUE_SEPARATOR}valueC`,
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
      `${CLI_FLAG_LONG_PREFIX}flagC${CLI_FLAG_VALUE_SEPARATOR}value`,
      'command-target',
    ];
    const inputB = [
      `${CLI_FLAG_LONG_PREFIX}flagC${CLI_FLAG_VALUE_SEPARATOR}value`,
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
      `${CLI_FLAG_LONG_PREFIX}flagB${CLI_FLAG_VALUE_SEPARATOR}value`,
      'command-target',
    ];
    const inputB = [
      `${CLI_FLAG_SHORT_PREFIX}fa`,
      `${CLI_FLAG_SHORT_PREFIX}fb${CLI_FLAG_VALUE_SEPARATOR}value`,
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
      `${CLI_FLAG_LONG_PREFIX}flagC${CLI_FLAG_VALUE_SEPARATOR}value`,
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
      `flagB${CLI_FLAG_VALUE_SEPARATOR}valueB`,
      `${CLI_FLAG_LONG_PREFIX}flagC${CLI_FLAG_VALUE_SEPARATOR}valueC`,
      'command-target',
    ];
    const expectedArgs = {
      command: {
        name: `flagB${CLI_FLAG_VALUE_SEPARATOR}valueB`,
        args: [
          `${CLI_FLAG_LONG_PREFIX}flagC${CLI_FLAG_VALUE_SEPARATOR}valueC`,
          'command-target',
        ],
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
      `++flagB${CLI_FLAG_VALUE_SEPARATOR}valueB`,
      `${CLI_FLAG_LONG_PREFIX}flagC${CLI_FLAG_VALUE_SEPARATOR}valueC`,
      'command-target',
    ];
    const expectedArgs = {
      command: {
        name: `++flagB${CLI_FLAG_VALUE_SEPARATOR}valueB`,
        args: [
          `${CLI_FLAG_LONG_PREFIX}flagC${CLI_FLAG_VALUE_SEPARATOR}valueC`,
          'command-target',
        ],
      },
      options: {
        flagA: true,
      },
    };

    expect(parse(input, schema)).toEqual(expectedArgs);
  });

  it('should throw an error when a option requires a value but the value is missing', () => {
    const noValuedFlag = 'flagC';
    const input = [`${CLI_FLAG_LONG_PREFIX}${noValuedFlag}`, 'command-target'];

    expect(() => parse(input, schema)).toThrow(
      `Error parsing CLI input: Expected value for option "${noValuedFlag}"`,
    );
  });

  it('should throw an error when a value is provided to a non-valuable option', () => {
    const valuedFlag = 'help';
    const input = [
      `${CLI_FLAG_LONG_PREFIX}${valuedFlag}${CLI_FLAG_VALUE_SEPARATOR}value`,
      'command-target',
    ];

    expect(() => parse(input, schema)).toThrow(
      `Error parsing CLI input: Unexpected value for option "${valuedFlag}"`,
    );
  });

  it('should treat the combination of a flag and its value as a unique flag when the flag-value separator is missing', () => {
    const unseparatedOption = 'flagCvalue';
    const input = [
      `${CLI_FLAG_LONG_PREFIX}${unseparatedOption}`,
      'command-target',
    ];

    expect(() => parse(input, schema)).toThrow(
      `Error parsing CLI input: Unknown option "${unseparatedOption}"`,
    );
  });

  it('should treat the combination of a flag and its value as a unique flag when the flag-value separator is invalid', () => {
    const invalidSeparatedOption = 'flagC:value';
    const input = [
      `${CLI_FLAG_LONG_PREFIX}${invalidSeparatedOption}`,
      'command-target',
    ];

    expect(() => parse(input, schema)).toThrow(
      `Error parsing CLI input: Unknown option "${invalidSeparatedOption}"`,
    );
  });

  it('should return an array containing multiple values for multi-valued options when multiple values are provided to those options', () => {
    const input = [
      `${CLI_FLAG_LONG_PREFIX}flagB${CLI_FLAG_VALUE_SEPARATOR}${['value1', 'value2', 'value3', 'value4'].join(CLI_OPTION_VALUES_SEPARATOR)}`,
      'command-target',
    ];
    const expectedOptions = {
      flagB: ['value1', 'value2', 'value3', 'value4'],
    };

    expect(parse(input, schema).options).toEqual(expectedOptions);
  });

  it('should return an array containing a single value for multi-valued options when only one value is provided to those options', () => {
    const input = [
      `${CLI_FLAG_LONG_PREFIX}flagB${CLI_FLAG_VALUE_SEPARATOR}value`,
      'command-target',
    ];
    const expectedOptions = {
      flagB: ['value'],
    };

    expect(parse(input, schema).options).toEqual(expectedOptions);
  });
});
