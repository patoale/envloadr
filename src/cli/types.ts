export type PrimitiveType = 'boolean' | 'string';

export type OptionSpecType = {
  isArray: boolean;
  primitiveType: PrimitiveType;
};

export interface OptionSpec {
  description: string;
  longFlag: string;
  shortFlag?: string;
  type?: OptionSpecType;
}

export type SpecSchema = Record<string, OptionSpec>;
