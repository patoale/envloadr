import type { SpecSchema } from '@/cli/types';
import type { Args } from './types';

export declare function parse<T extends SpecSchema>(
  input: string[],
  schema: T,
): Args<T>;
