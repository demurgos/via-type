import { IoType, Reader, Writer } from "./index.js";

export type Diff = any;

export class AnyType<T = any> implements IoType<T> {
  constructor() {
  }

  read<R>(_reader: Reader<R>, raw: R): T {
    return <any> raw as T;
  }

  // TODO: Dynamically add with prototype?
  write<W>(writer: Writer<W>, value: T): W {
    return writer.writeAny(value);
  }

  testError(value: unknown): Error | undefined {
    try {
      JSON.parse(JSON.stringify(value));
      return undefined;
    } catch (err) {
      return err;
    }
  }

  test(_value: unknown): _value is T {
    return true;
  }

  equals(val1: T, val2: T): boolean {
    // TODO: From arg
    return val1 === val2;
  }

  clone(val: T): T {
    return JSON.parse(JSON.stringify(val));
  }
}

export const $Any: AnyType = new AnyType();
