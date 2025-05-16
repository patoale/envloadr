export type OptionSpecType = 'boolean' | 'string' | 'stringArray';

type OptionSpecParam = {
  type: OptionSpecType;
  name?: string;
};

export interface OptionSpec {
  description: string;
  longFlag: string;
  shortFlag?: string;
  param?: OptionSpecParam;
}

export type SpecSchema = Record<string, OptionSpec>;

type OptionSpecTypeMap = Record<OptionSpecType, unknown> & {
  boolean: boolean;
  string: string;
  stringArray: string[];
};

type OptionType<T extends OptionSpecParam | undefined> =
  T extends OptionSpecParam ? OptionSpecTypeMap[T['type']] : boolean;

export type Options<T extends SpecSchema> = {
  [K in keyof T]?: OptionType<T[K]['param']>;
};

export type Args<T extends SpecSchema> = {
  command: {
    name: string;
    args: string[];
  };
  options?: Options<T>;
};
