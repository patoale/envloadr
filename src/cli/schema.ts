export default {
  file: {
    description:
      'Specifies the filepath(s) to load environment variables from (default: .env)',
    longFlag: 'file',
    shortFlag: 'f',
    type: 'stringArray',
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
    type: 'boolean',
  },
} as const;
