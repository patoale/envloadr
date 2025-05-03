import type { OptionSpecType, PrimitiveType, SpecSchema } from '@/cli/types';

type PrimitiveTypeMap = Record<PrimitiveType, unknown> & {
  boolean: boolean;
  string: string;
};

type OptionType<T extends OptionSpecType | undefined> = T extends OptionSpecType
  ? T['isArray'] extends true
    ? PrimitiveTypeMap[T['primitiveType']][]
    : PrimitiveTypeMap[T['primitiveType']]
  : boolean;

type Options<T extends SpecSchema> = {
  [K in keyof T]: OptionType<T[K]['type']>;
};

export type Input<T extends SpecSchema> = {
  command: {
    name: string;
    args: string[];
  };
  options?: Options<T>;
};
