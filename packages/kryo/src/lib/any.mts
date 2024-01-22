import {CheckId, IoType, KryoContext, Reader, Result,Writer} from "./index.mjs";

export type Diff = any;

/**
 * Type representing an opaque value.
 */
export class AnyType<T = any> implements IoType<T> {
  read<R>(_cx: KryoContext, _reader: Reader<R>, raw: R): Result<T, CheckId> {
    return {ok: true, value: raw as unknown as T};
  }

  write<W>(writer: Writer<W>, value: T): W {
    return writer.writeAny(value);
  }

  test(_cx: KryoContext, value: unknown): Result<T, never> {
    return {ok: true, value: value as unknown as T};
  }

  equals(val1: T, val2: T): boolean {
    return val1 === val2;
  }

  clone(value: T): T {
    return value;
  }
}

export const $Any: AnyType = new AnyType();
