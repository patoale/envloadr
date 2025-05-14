export default {
  file: {
    description:
      'Specifies the filepath(s) to load environment variables from (default: .env)',
    longFlag: 'file',
    shortFlag: 'f',
    type: 'stringArray',
  },
} as const;
