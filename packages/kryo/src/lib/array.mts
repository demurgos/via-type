import {writeError} from "./_helpers/context.mjs";
import {lazyProperties} from "./_helpers/lazy-properties.mjs";
import {CheckKind} from "./checks/check-kind.mjs";
import {CheckId, IoType, KryoContext, Lazy, NOOP_CONTEXT, Reader, Result, Type, Writer} from "./index.mjs";
import {readVisitor} from "./readers/read-visitor.mjs";

export type Name = "array";
export const name: Name = "array";
export type Diff = any;

/**
 * T: Item type
 * M: Meta-Type
 */
export interface ArrayTypeOptions<T, M extends Type<T> = Type<T>> {
  itemType: M;
  minLength?: number;
  maxLength: number;
}

export interface ArrayTypeConstructor {
  /**
   * Create a new array type with full read/write support
   */
  new<T>(options: Lazy<ArrayTypeOptions<T, IoType<T>>>): ArrayIoType<T, IoType<T>>;

  /**
   * Create a new simple array type
   */
  new<T>(options: Lazy<ArrayTypeOptions<T>>): ArrayType<T>;
}

export interface ArrayType<T, M extends Type<T> = Type<T>> extends Type<T[]>, ArrayTypeOptions<T, M> {
}

export interface ArrayIoType<T, M extends IoType<T> = IoType<T>> extends IoType<T[]>,
  ArrayTypeOptions<T, M> {
}

// tslint:disable-next-line:variable-name
export const ArrayType: ArrayTypeConstructor = class<T, M extends Type<T> = Type<T>> {
  readonly name: Name = name;
  readonly itemType!: M;
  readonly minLength?: number;
  readonly maxLength!: number;

  private _options: Lazy<ArrayTypeOptions<T, M>>;

  constructor(options: Lazy<ArrayTypeOptions<T, M>>) {
    this._options = options;
    if (typeof options !== "function") {
      this._applyOptions();
    } else {
      lazyProperties(this, this._applyOptions, ["itemType", "minLength", "maxLength"]);
    }
  }

  read<R>(cx: KryoContext, reader: Reader<R>, raw: R): Result<T[], CheckId> {
    const itemType: M = this.itemType;
    const minLength: number | undefined = this.minLength;
    const maxLength: number = this.maxLength;

    return reader.readList(cx, raw, readVisitor({
      fromList<RI>(input: Iterable<RI>, itemReader: Reader<RI>): Result<T[], CheckId> {
        let failedChecks: undefined | Set<CheckId> = undefined;
        const result: T[] = [];
        let i: number = 0;
        for (const rawItem of input) {
          if (i >= maxLength) {
            return writeError(cx, {check: CheckKind.Size as const, min: minLength ?? 0, max: maxLength});
          }
          if (itemType.read === undefined) {
            throw new Error(`read is not supported for Array with non-readable type ${itemType.name}`);
          }
          const {ok, value: item} = itemType.read!(cx, itemReader, rawItem);
          if (ok) {
            if (failedChecks === undefined) {
              // Happy path: push to the result
              // (otherwise skip, we'll return an error anyway)
              result.push(item);
            }
          } else {
            if (failedChecks === undefined) {
              failedChecks = new Set();
            }
            failedChecks.add(item);
          }
          i++;
        }
        if (failedChecks !== undefined) {
          return writeError(cx, {check: CheckKind.Aggregate as const, children: [...failedChecks]});
        }
        if (minLength !== undefined && i < minLength) {
          return writeError(cx, {check: CheckKind.Size as const, min: minLength ?? 0, max: maxLength, actual: i});
        }
        return {ok: true, value: result};
      },
    }));
  }

  write<W>(writer: Writer<W>, value: T[]): W {
    return writer.writeList(value.length, <IW,>(index: number, itemWriter: Writer<IW>): IW => {
      if (this.itemType.write === undefined) {
        throw new Error(`write is not supported for Array with non-writable type ${this.itemType.name}`);
      }
      return this.itemType.write(itemWriter, value[index]);
    });
  }

  test(cx: KryoContext | null, value: unknown): Result<T[], CheckId> {
    if (!Array.isArray(value)) {
      return writeError(cx,{check: CheckKind.BaseType, expected: ["Array"]});
    }
    if (value.length > this.maxLength || (this.minLength !== undefined && value.length < this.minLength)) {
      return writeError(cx, {check: CheckKind.Size, min: this.minLength ?? 0, max: this.maxLength, actual: value.length});
    }
    const itemCount: number = value.length;
    let errors: CheckId[] | undefined = undefined;
    for (let i: number = 0; i < itemCount; i++) {
      const {ok, value: itemValue} = (cx ?? NOOP_CONTEXT).enter(i, () => this.itemType.test(cx, value[i]));
      if (!ok) {
        errors ??= [];
        errors.push(itemValue);
      }
    }
    if (errors !== undefined) {
      return writeError(cx, {check: CheckKind.Aggregate, children: errors});
    }
    return {ok: true, value};
  }

  equals(left: T[], right: T[]): boolean {
    if (left.length !== right.length) {
      return false;
    }
    for (let i: number = 0; i < left.length; i++) {
      if (!this.itemType.equals(left[i], right[i])) {
        return false;
      }
    }
    return true;
  }

  lte(left: T[], right: T[]): boolean {
    const minLength: number = Math.min(left.length, right.length);
    for (let i: number = 0; i < minLength; i++) {
      const leftItem: T = left[i];
      const rightItem: T = right[i];
      if (!this.itemType.equals(leftItem, rightItem)) {
        return this.itemType.lte!(leftItem, rightItem);
      }
    }
    return left.length <= right.length;
  }

  clone(val: T[]): T[] {
    return val.map((item: T): T => this.itemType.clone(item));
  }

  private _applyOptions(): void {
    if (this._options === undefined) {
      throw new Error("missing `_options` for lazy initialization");
    }
    const options: ArrayTypeOptions<T, M> = typeof this._options === "function" ? this._options() : this._options;

    const itemType: M = options.itemType;
    const minLength: number | undefined = options.minLength;
    const maxLength: number = options.maxLength;

    Object.assign(this, {itemType, minLength, maxLength});
  }
};
