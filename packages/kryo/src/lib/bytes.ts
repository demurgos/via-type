import { lazyProperties } from "./_helpers/lazy-properties.js";
import { createInvalidTypeError } from "./errors/invalid-type.js";
import { createLazyOptionsError } from "./errors/lazy-options.js";
import { createMaxArrayLengthError } from "./errors/max-array-length.js";
import { createNotImplementedError } from "./errors/not-implemented.js";
import { IoType, Lazy, Ord, Reader, VersionedType, Writer } from "./index.js";
import { readVisitor } from "./readers/read-visitor.js";

export type Diff = any;

export interface BytesTypeOptions {
  maxLength: number;
}

export class BytesType implements IoType<Uint8Array>, VersionedType<Uint8Array, Diff>, Ord<Uint8Array> {
  readonly maxLength!: number;

  private _options: Lazy<BytesTypeOptions>;

  constructor(options: Lazy<BytesTypeOptions>) {
    this._options = options;
    if (typeof options !== "function") {
      this._applyOptions();
    } else {
      lazyProperties(this, this._applyOptions, ["maxLength"]);
    }
  }

  // TODO: Dynamically add with prototype?
  read<R>(reader: Reader<R>, raw: R): Uint8Array {
    return reader.readBytes(raw, readVisitor({
      fromBytes: (input: Uint8Array): Uint8Array => {
        const err: Error | undefined = this.testError(input);
        if (err !== undefined) {
          throw err;
        }
        return input;
      },
    }));
  }

  // TODO: Dynamically add with prototype?
  write<W>(writer: Writer<W>, value: Uint8Array): W {
    return writer.writeBytes(value);
  }

  testError(val: unknown): Error | undefined {
    if (!(val instanceof Uint8Array)) {
      return createInvalidTypeError("Uint8Array", val);
    }
    if (this.maxLength !== undefined && val.length > this.maxLength) {
      return createMaxArrayLengthError(val, this.maxLength);
    }
    return undefined;
  }

  test(value: unknown): value is Uint8Array {
    return this.testError(value) === undefined;
  }

  equals(left: Uint8Array, right: Uint8Array): boolean {
    if (left.length !== right.length) {
      return false;
    }
    for (let i: number = 0; i < left.length; i++) {
      if (left[i] !== right[i]) {
        return false;
      }
    }
    return true;
  }

  lte(left: Uint8Array, right: Uint8Array): boolean {
    const minLength: number = Math.min(left.length, right.length);
    for (let i: number = 0; i < minLength; i++) {
      if (left[i] > right[i]) {
        return false;
      }
    }
    return left.length <= right.length;
  }

  clone(val: Uint8Array): Uint8Array {
    return Uint8Array.from(val);
  }

  /**
   * @param _oldVal
   * @param _newVal
   * @returns `true` if there is a difference, `undefined` otherwise
   */
  diff(_oldVal: Uint8Array, _newVal: Uint8Array): Diff | undefined {
    throw createNotImplementedError("BufferType#diff");
  }

  patch(_oldVal: Uint8Array, _diff: Diff | undefined): Uint8Array {
    throw createNotImplementedError("BufferType#patch");
  }

  reverseDiff(_diff: Diff | undefined): Diff | undefined {
    throw createNotImplementedError("BufferType#reverseDiff");
  }

  squash(_diff1: Diff | undefined, _diff2: Diff | undefined): Diff | undefined {
    throw createNotImplementedError("BufferType#squash");
  }

  private _applyOptions(): void {
    if (this._options === undefined) {
      throw createLazyOptionsError(this);
    }
    const options: BytesTypeOptions = typeof this._options === "function" ? this._options() : this._options;

    const maxLength: number = options.maxLength;

    Object.assign(this, {maxLength});
  }
}

export const $Bytes: BytesType = new BytesType({maxLength: Infinity});
