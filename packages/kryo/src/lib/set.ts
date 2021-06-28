import incident from "incident";

import { lazyProperties } from "./_helpers/lazy-properties.js";
import { testError } from "./_helpers/test-error.js";
import { createInvalidTypeError } from "./errors/invalid-type.js";
import { createLazyOptionsError } from "./errors/lazy-options.js";
import { createNotImplementedError } from "./errors/not-implemented.js";
import { IoType, Lazy, Ord, Reader, VersionedType, Writer } from "./index.js";
import { readVisitor } from "./readers/read-visitor.js";

export type Name = "set";
export const name: Name = "set";
export type Diff = any;

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

  // TODO: Dynamically add with prototype?
  read<R>(reader: Reader<R>, raw: R): Set<T> {
    return reader.readList(raw, readVisitor({
      fromList: <RI>(input: Iterable<RI>, itemReader: Reader<RI>): Set<T> => {
        const resultList: T[] = [];
        for (const rawItem of input) {
          const item: T = this.itemType.read!(itemReader, rawItem);
          resultList.push(item);
        }
        resultList.sort((left, right): -1 | 0 | 1 => {
          if (this.itemType.lte(left, right)) {
            return this.itemType.equals(left, right) ? 0 : -1;
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
        const error: Error | undefined = this.testError(result);
        if (error !== undefined) {
          throw error;
        }
        return result;
      },
    }));
  }

  // TODO: Dynamically add with prototype?
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
      <IW>(index: number, itemWriter: Writer<IW>): IW => {
        if (this.itemType.write === undefined) {
          throw new incident.Incident("NotWritable", {type: this.itemType});
        }
        return this.itemType.write(itemWriter, items[index]);
      },
    );
  }

  testError(val: unknown): Error | undefined {
    if (!(val instanceof Set)) {
      return createInvalidTypeError("Set", val);
    }
    if (val.size > this.maxSize) {
      return new incident.Incident("MaxSetSize", {maxSize: this.maxSize, actualSize: val.size}, "Invalid set: max size exceeded");
    }
    for (const item of val) {
      const itemError: Error | undefined = testError(this.itemType, item);
      if (itemError !== undefined) {
        return new incident.Incident("InvalidSetItem", {item}, "Invalid set item");
      }
    }
    return undefined;
  }

  test(val: unknown): val is Set<T> {
    if (!(val instanceof Set)) {
      return false;
    }
    if (val.size > this.maxSize) {
      return false;
    }
    for (const item of val) {
      if (!this.itemType.test(item)) {
        return false;
      }
    }
    return true;
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

    for (let i: number = 0; i < Math.max(left.size, right.size); i++) {
      if (i >= right.size) {
        return false;
      } else if (i >= left.size) {
        return true;
      } else {
        const leftItem: T = leftList[i];
        const rightItem: T = rightList[i];
        if (!this.itemType.equals(leftItem, rightItem)) {
          return this.itemType.lte!(leftItem, rightItem);
        }
      }
    }
    return true;
  }

  clone(val: Set<T>): Set<T> {
    const result: Set<T> = new Set();
    for (const item of val) {
      const itemClone: T = this.itemType.clone(item);
      result.add(itemClone);
    }
    return result;
  }

  diff(_oldVal: Set<T>, _newVal: Set<T>): Diff | undefined {
    throw createNotImplementedError("SetType#diff");
  }

  patch(_oldVal: Set<T>, _diff: Diff | undefined): Set<T> {
    throw createNotImplementedError("SetType#patch");
  }

  reverseDiff(_diff: Diff | undefined): Diff | undefined {
    throw createNotImplementedError("SetType#reverseDiff");
  }

  squash(_diff1: Diff | undefined, _diff2: Diff | undefined): Diff | undefined {
    throw createNotImplementedError("SetType#squash");
  }

  private _applyOptions(): void {
    if (this._options === undefined) {
      throw createLazyOptionsError(this);
    }
    const options: SetTypeOptions<T> = typeof this._options === "function" ? this._options() : this._options;

    const itemType: VersionedType<T, any> & Ord<T> = options.itemType;
    const maxSize: number = options.maxSize;

    Object.assign(this, {itemType, maxSize});
  }
}
