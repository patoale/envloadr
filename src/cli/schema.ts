export default {
  files: {
    description:
      'Specifies the filepath(s) to load environment variables from (default: .env)',
    longFlag: 'file',
    shortFlag: 'f',
    param: {
      type: 'stringArray',
      name: 'file',
    },
  },
  help: {
    description:
      'Displays help information about the available options and their usage',
    longFlag: 'help',
    shortFlag: 'h',
  },
  noOverride: {
    description:
      'Prevents overwriting, ensuring repeated variables keep their initial value',
    longFlag: 'no-override',
    param: {
      type: 'boolean',
    },
  },
  verbose: {
    description:
      'Enables detailed console output during the loading of environment variables',
    longFlag: 'verbose',
    shortFlag: 'v',
    param: {
      type: 'boolean',
    },
  },
} as const;
