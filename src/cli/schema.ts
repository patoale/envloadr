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
} as const;
