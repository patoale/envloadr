import type { SpecSchema } from '@/cli/types';
import type { Input } from './types';

export declare function parse<T extends SpecSchema>(
  input: string[],
  schema: T,
): Input<T>;
