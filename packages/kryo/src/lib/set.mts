import {enter, writeError} from "./_helpers/context.mjs";
import {lazyProperties} from "./_helpers/lazy-properties.mjs";
import {CheckKind} from "./checks/check-kind.mjs";
import {CheckId, IoType, KryoContext, Lazy, Ord, Reader, Result,VersionedType, Writer} from "./index.mjs";
import {readVisitor} from "./readers/read-visitor.mjs";

export type Name = "set";
export const name: Name = "set";
export type Diff<T = unknown> = [Set<T>, Set<T>];

export interface SetTypeOptions<T> {
  itemType: VersionedType<T, any> & Ord<T>;
  maxSize: number;
}

export class SetType<T> implements IoType<Set<T>>, VersionedType<Set<T>, Diff> {
  readonly name: Name = name;
  readonly itemType!: VersionedType<T, any> & Ord<T>;
  readonly maxSize!: number;

  private _options: Lazy<SetTypeOptions<T>>;

  constructor(options: Lazy<SetTypeOptions<T>>) {
    this._options = options;
    if (typeof options !== "function") {
      this._applyOptions();
    } else {
      lazyProperties(this, this._applyOptions, ["itemType", "maxSize"]);
    }
  }

  read<R>(cx: KryoContext, reader: Reader<R>, raw: R): Result<Set<T>, CheckId> {
    const itemType = this.itemType;
    return reader.readList(cx, raw, readVisitor({
      fromList: <RI, >(input: Iterable<RI>, itemReader: Reader<RI>): Result<Set<T>, CheckId> => {
        const resultList: T[] = [];
        let itemErrors: CheckId[] | undefined = undefined;
        for (const rawItem of input) {
          if (itemType.read === undefined) {
            throw new Error(`read is not supported for Set with non-readable type ${itemType.name}`);
          }
          const {ok, value} = itemType.read(cx, itemReader, rawItem);
          if (ok) {
            resultList.push(value);
          } else {
            if (itemErrors === undefined) {
              itemErrors = [];
            }
            itemErrors.push(value);
          }
        }
        if (itemErrors !== undefined) {
          return writeError(cx, {check: CheckKind.Aggregate, children: itemErrors});
        }

        resultList.sort((left, right): -1 | 0 | 1 => {
          if (itemType.lte(left, right)) {
            return itemType.equals(left, right) ? 0 : -1;
          } else {
            return 1;
          }
        });
        const result: Set<T> = new Set();
        if (resultList.length > 0) {
          result.add(resultList[0]);
          for (let i: number = 1; i < resultList.length; i++) {
            if (!this.itemType.equals(resultList[i], resultList[i - 1])) {
              result.add(resultList[i]);
            }
          }
        }
        return {ok: true, value: result};
      },
    }));
  }

  write<W>(writer: Writer<W>, value: Set<T>): W {
    const items: T[] = [...value];

    items.sort((left, right): -1 | 0 | 1 => {
      if (this.itemType.lte(left, right)) {
        return this.itemType.equals(left, right) ? 0 : -1;
      } else {
        return 1;
      }
    });

    return writer.writeList(
      items.length,
      <IW, >(index: number, itemWriter: Writer<IW>): IW => {
        if (this.itemType.write === undefined) {
          throw new Error(`write is not supported for Set with non-writable type ${this.itemType.name}`);
        }
        return this.itemType.write(itemWriter, items[index]);
      },
    );
  }

  test(cx: KryoContext | null, value: unknown): Result<Set<T>, CheckId> {
    if (!(value instanceof Set)) {
      return writeError(cx, {check: CheckKind.BaseType, expected: ["Object"]});
    }
    if (value.size > this.maxSize) {
      return writeError(cx, {check: CheckKind.Size, min: 0, max: this.maxSize, actual: value.size});
    }
    let itemErrors: CheckId[] | undefined = undefined;
    let i: number = 0;
    for (const item of value) {
      const {ok, value: actual} = enter(cx, i, () => this.itemType.test(cx, item));
      i++;
      if (!ok) {
        if (itemErrors === undefined) {
          itemErrors = [];
        }
        itemErrors.push(actual);
      }
    }
    if (itemErrors !== undefined) {
      return writeError(cx, {check: CheckKind.Aggregate, children: itemErrors});
    }
    return {ok: true, value};
  }

  equals(left: Set<T>, right: Set<T>): boolean {
    if (left.size !== right.size) {
      return false;
    }
    const leftList: T[] = [...left];
    const rightList: T[] = [...right];

    const compare = (left: T, right: T): -1 | 0 | 1 => {
      if (this.itemType.lte(left, right)) {
        return this.itemType.equals(left, right) ? 0 : -1;
      } else {
        return 1;
      }
    };

    leftList.sort(compare);
    rightList.sort(compare);

    for (let i: number = 0; i < right.size; i++) {
      const leftItem: T = leftList[i];
      const rightItem: T = rightList[i];
      if (!this.itemType.equals(leftItem, rightItem)) {
        return false;
      }
    }
    return true;
  }

  lte(left: Set<T>, right: Set<T>): boolean {
    const leftList: T[] = [...left];
    const rightList: T[] = [...right];

    const compare = (left: T, right: T): -1 | 0 | 1 => {
      if (this.itemType.lte(left, right)) {
        return this.itemType.equals(left, right) ? 0 : -1;
      } else {
        return 1;
      }
    };

    leftList.sort(compare);
    rightList.sort(compare);

    const minLength: number = Math.min(leftList.length, rightList.length);
    for (let i: number = 0; i < minLength; i++) {
      const leftItem: T = leftList[i];
      const rightItem: T = rightList[i];
      if (!this.itemType.equals(leftItem, rightItem)) {
        return this.itemType.lte!(leftItem, rightItem);
      }
    }
    return leftList.length <= rightList.length;
  }

  clone(val: Set<T>): Set<T> {
    const result: Set<T> = new Set();
    for (const item of val) {
      const itemClone: T = this.itemType.clone(item);
      result.add(itemClone);
    }
    return result;
  }

  diff(oldVal: Set<T>, newVal: Set<T>): Diff<T> | undefined {
    return this.equals(oldVal, newVal) ? undefined : [oldVal, newVal];
  }

  patch(oldVal: Set<T>, diff: Diff<T> | undefined): Set<T> {
    return diff !== undefined ? diff[1] : oldVal;
  }

  reverseDiff(diff: Diff<T> | undefined): Diff<T> | undefined {
    return diff !== undefined ? [diff[1], diff[0]] : undefined;
  }

  squash(diff1: Diff<T> | undefined, diff2: Diff<T> | undefined): Diff<T> | undefined {
    return diff1 !== undefined && diff2 !== undefined ? [diff1[0], diff2[1]] : undefined;
  }

  private _applyOptions(): void {
    if (this._options === undefined) {
      throw new Error("missing `_options` for lazy initialization");
    }
    const options: SetTypeOptions<T> = typeof this._options === "function" ? this._options() : this._options;

    const itemType: VersionedType<T, any> & Ord<T> = options.itemType;
    const maxSize: number = options.maxSize;

    Object.assign(this, {itemType, maxSize});
  }
}
