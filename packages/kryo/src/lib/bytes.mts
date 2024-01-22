import {lazyProperties} from "./_helpers/lazy-properties.mjs";
import {writeError} from "./_helpers/write-error.mjs";
import {CheckKind} from "./checks/check-kind.mjs";
import {CheckId, IoType, KryoContext, Lazy, Ord, Reader, Result, VersionedType, Writer} from "./index.mjs";
import {readVisitor} from "./readers/read-visitor.mjs";

export type Diff = [Uint8Array, Uint8Array];

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

  read<R>(cx: KryoContext, reader: Reader<R>, raw: R): Result<Uint8Array, CheckId> {
    return reader.readBytes(cx, raw, readVisitor({
      fromBytes: (input: Uint8Array): Result<Uint8Array, CheckId> => {
        return this.test(cx, input);
      },
    }));
  }

  write<W>(writer: Writer<W>, value: Uint8Array): W {
    return writer.writeBytes(value);
  }

  test(cx: KryoContext | null, value: unknown): Result<Uint8Array, CheckId> {
    if (!(value instanceof Uint8Array)) {
      return writeError(cx,{check: CheckKind.BaseType, expected: ["Bytes"]});
    }
    if (value.length > this.maxLength) {
      return writeError(cx,{check: CheckKind.Size, min: 0, max: this.maxLength, actual: value.length});
    }
    return {ok: true, value};
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
      if (left[i] !== right[i]) {
        return left[i] <= right[i];
      }
    }
    return left.length <= right.length;
  }

  clone(val: Uint8Array): Uint8Array {
    return Uint8Array.from(val);
  }

  /**
   * @param oldVal
   * @param newVal
   * @returns `true` if there is a difference, `undefined` otherwise
   */
  diff(oldVal: Uint8Array, newVal: Uint8Array): Diff | undefined {
    return this.equals(oldVal, newVal) ? undefined : [oldVal, newVal];
  }

  patch(oldVal: Uint8Array, diff: Diff | undefined): Uint8Array {
    return diff !== undefined ? diff[1] : oldVal;
  }

  reverseDiff(diff: Diff | undefined): Diff | undefined {
    return diff !== undefined ? [diff[1], diff[0]] : undefined;
  }

  squash(diff1: Diff | undefined, diff2: Diff | undefined): Diff | undefined {
    return diff1 !== undefined && diff2 !== undefined ? [diff1[0], diff2[1]] : undefined;
  }

  private _applyOptions(): void {
    if (this._options === undefined) {
      throw new Error("missing `_options` for lazy initialization");
    }
    const options: BytesTypeOptions = typeof this._options === "function" ? this._options() : this._options;

    const maxLength: number = options.maxLength;

    Object.assign(this, {maxLength});
  }
}

export const $Bytes: BytesType = new BytesType({maxLength: Infinity});
