export interface OptionSpec {
  description: string;
  longFlag: string;
  shortFlag?: string;
  type?: {
    isArray: boolean;
    primitiveType: 'boolean' | 'string';
  };
}
