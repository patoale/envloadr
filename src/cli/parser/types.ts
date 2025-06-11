type BooleanType = 'boolean';

type AliasedParam = {
  alias: string;
  type: 'string' | 'stringArray';
};

export type OptionSpecParam = BooleanType | AliasedParam;

export interface OptionSpec {
  description: string;
  longFlag: string;
  shortFlag?: string;
  param?: OptionSpecParam;
}

export type SpecSchema = Record<string, OptionSpec>;

type OptionSpecTypeMap = {
  boolean: boolean;
  string: string;
  stringArray: string[];
};

type OptionType<T extends OptionSpecParam | undefined> = T extends BooleanType
  ? OptionSpecTypeMap[T]
  : T extends AliasedParam
    ? OptionSpecTypeMap[T['type']]
    : boolean;

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
