export type OptionSpecType = 'boolean' | 'string' | 'stringArray';

export interface OptionSpec {
  description: string;
  longFlag: string;
  shortFlag?: string;
  type?: OptionSpecType;
}

export type SpecSchema = Record<string, OptionSpec>;
