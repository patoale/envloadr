import type { OptionSpecType, SpecSchema } from '@/cli/types';

type OptionSpecTypeMap = Record<OptionSpecType, unknown> & {
  boolean: boolean;
  string: string;
  stringArray: string[];
};

type OptionType<T extends OptionSpecType | undefined> = T extends OptionSpecType
  ? OptionSpecTypeMap[T]
  : boolean;

type Options<T extends SpecSchema> = {
  [K in keyof T]?: OptionType<T[K]['type']>;
};

export type Args<T extends SpecSchema> = {
  command: {
    name: string;
    args: string[];
  };
  options?: Options<T>;
};
