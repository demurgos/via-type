import {lazyProperties} from "./_helpers/lazy-properties.mjs";
import {writeError} from "./_helpers/write-error.mjs";
import {CheckKind} from "./checks/check-kind.mjs";
import {CheckId, IoType, KryoContext, Lazy, Reader, Result, VersionedType, Writer} from "./index.mjs";
import {readVisitor} from "./readers/read-visitor.mjs";

export type Name = "map";
export const name: Name = "map";
export type Diff<K, V> = [Map<K, V>, Map<K, V>];

export interface MapTypeOptions<K, V> {
  keyType: VersionedType<K, any>;
  valueType: VersionedType<V, any>;
  maxSize: number;
  assumeStringKey?: boolean;
}

export class MapType<K, V> implements IoType<Map<K, V>>, VersionedType<Map<K, V>, Diff<K, V>> {
  readonly name: Name = name;
  readonly keyType!: VersionedType<K, any>;
  readonly valueType!: VersionedType<V, any>;
  readonly maxSize!: number;
  readonly assumeStringKey!: boolean;

  private _options: Lazy<MapTypeOptions<K, V>>;

  constructor(options: Lazy<MapTypeOptions<K, V>>) {
    this._options = options;
    if (typeof options !== "function") {
      this._applyOptions();
    } else {
      lazyProperties(this, this._applyOptions, ["keyType", "valueType", "maxSize", "assumeStringKey"]);
    }
  }

  read<R>(cx: KryoContext, reader: Reader<R>, raw: R): Result<Map<K, V>, CheckId> {
    if (this.assumeStringKey) {
      return reader.readRecord(cx, raw, readVisitor({
        fromMap: <RK, RV>(input: Map<RK, RV>, keyReader: Reader<RK>, valueReader: Reader<RV>): Result<Map<K, V>, CheckId> => {
          const result: Map<K, V> = new Map();
          let errors: CheckId[] | undefined = undefined;
          for (const [rawKey, rawValue] of input) {
            const {ok: okUnecheckedKey, value: uncheckedKey} = keyReader.readString(
              cx,
              rawKey,
              readVisitor({fromString: (value: string): Result<string, CheckId> => ({ok: true, value})}),
            );
            if (!okUnecheckedKey) {
              errors ??= [];
              errors.push(uncheckedKey);
              continue;
            }

            const {ok: okKey, value: key} = this.keyType.test(cx, uncheckedKey);
            if (!okKey) {
              errors ??= [];
              errors.push(key);
              continue;
            }
            const {ok, value} = this.valueType.read!(cx, valueReader, rawValue);
            if (!ok) {
              errors ??= [];
              errors.push(value);
              continue;
            }
            result.set(key, value);
          }
          if (result.size > this.maxSize) {
            return writeError(cx,{check: CheckKind.Size, min: 0, max: this.maxSize, actual: result.size});
          }
          if (errors !== undefined) {
            writeError(cx, {check: CheckKind.Aggregate, children: errors});
          }
          return {ok: true, value: result};
        },
      }));
    } else {
      return reader.readMap(cx, raw, readVisitor({
        fromMap: <RK, RV>(input: Map<RK, RV>, keyReader: Reader<RK>, valueReader: Reader<RV>): Result<Map<K, V>, CheckId> => {
          const result: Map<K, V> = new Map();
          let errors: CheckId[] | undefined = undefined;
          for (const [rawKey, rawValue] of input) {
            const {ok: okKey, value: key} = this.keyType.read!(cx, keyReader, rawKey);
            if (!okKey) {
              errors ??= [];
              errors.push(key);
              continue;
            }
            const {ok: okValue, value} = this.valueType.read!(cx, valueReader, rawValue);
            if (!okValue) {
              errors ??= [];
              errors.push(value);
              continue;
            }
            result.set(key, value);
          }
          if (result.size > this.maxSize) {
            return writeError(cx,{check: CheckKind.Size, min: 0, max: this.maxSize, actual: result.size});
          }
          if (errors !== undefined) {
            writeError(cx, {check: CheckKind.Aggregate, children: errors});
          }
          return {ok: true, value: result};
        },
      }));
    }
  }

  write<W>(writer: Writer<W>, value: Map<K, V>): W {
    if (this.assumeStringKey) {
      return writer.writeRecord(
        value.keys() as Iterable<any> as Iterable<string>,
        <FW,>(outKey: string, fieldWriter: Writer<FW>): FW => {
          return this.valueType.write!(fieldWriter, value.get(outKey as any)!);
        },
      );
    }

    const entries: [K, V][] = [...value];

    return writer.writeMap(
      entries.length,
      <KW,>(index: number, keyWriter: Writer<KW>): KW => {
        if (this.keyType.write === undefined) {
          throw new Error("BUG: MapType#write is not supported because `keyType` does not implement `Writable<K>`");
        }
        return this.keyType.write(keyWriter, entries[index][0]);
      },
      <VW,>(index: number, valueWriter: Writer<VW>): VW => {
        if (this.valueType.write === undefined) {
          throw new Error("BUG: MapType#write is not supported because `valueType` does not implement `Writable<V>`");
        }
        return this.valueType.write(valueWriter, entries[index][1]);
      },
    );
  }

  test(cx: KryoContext, value: unknown): Result<Map<K, V>, CheckId> {
    if (!(value instanceof Map)) {
      return writeError(cx,{check: CheckKind.BaseType, expected: ["Object"]});
    }
    if (value.size > this.maxSize) {
      return writeError(cx,{check: CheckKind.Size, min: 0, max: this.maxSize, actual: value.size});
    }
    const i = 0;
    let errors: CheckId[] | undefined = undefined;
    for (const [rawKey, rawValue] of value) {
      const {ok, value} = cx.enter(i, (): Result<unknown, CheckId> => {
        const {ok: okKey, value: key} = cx.enter(0, () => this.keyType.test(cx, rawKey));
        if (!okKey) {
          return {ok: false, value: key};
        }
        return cx.enter(1, () => this.valueType.test(cx, rawValue));
      });
      if (!ok) {
        errors ??= [];
        errors.push(value);
      }
    }
    if (errors !== undefined ) {
      writeError(cx, {check: CheckKind.Aggregate, children: errors});
    }
    return {ok: true, value};
  }

  equals(val1: Map<K, V>, val2: Map<K, V>): boolean {
    if (val2.size !== val1.size) {
      return false;
    }
    const unmatched: Map<K, V> = new Map(val1);
    for (const [key2, value2] of val2) {
      for (const [key1, value1] of unmatched) {
        if (this.keyType.equals(key1, key2)) {
          if (!this.valueType.equals(value1, value2)) {
            return false;
          }
          unmatched.delete(key1);
          break;
        }
      }
    }
    return true;
  }

  clone(val: Map<K, V>): Map<K, V> {
    const result: Map<K, V> = new Map();
    for (const [key, value] of val) {
      const keyClone: K = this.keyType.clone(key);
      const valueClone: V = this.valueType.clone(value);
      result.set(keyClone, valueClone);
    }
    return result;
  }

  diff(oldVal: Map<K, V>, newVal: Map<K, V>): Diff<K, V> | undefined {
    return this.equals(oldVal, newVal) ? undefined : [oldVal, newVal];
  }

  patch(oldVal: Map<K, V>, diff: Diff<K, V> | undefined): Map<K, V> {
    return diff !== undefined ? diff[1] : oldVal;
  }

  reverseDiff(diff: Diff<K, V> | undefined): Diff<K, V> | undefined {
    return diff !== undefined ? [diff[1], diff[0]] : undefined;
  }

  squash(diff1: Diff<K, V> | undefined, diff2: Diff<K, V> | undefined): Diff<K, V> | undefined {
    return diff1 !== undefined && diff2 !== undefined ? [diff1[0], diff2[1]] : undefined;
  }

  private _applyOptions(): void {
    if (this._options === undefined) {
      throw new Error("missing `_options` for lazy initialization");
    }
    const options: MapTypeOptions<K, V> = typeof this._options === "function" ? this._options() : this._options;

    const keyType: VersionedType<K, any> = options.keyType;
    const valueType: VersionedType<V, any> = options.valueType;
    const maxSize: number = options.maxSize;
    const assumeStringKey: boolean = options.assumeStringKey || false;

    Object.assign(this, {keyType, valueType, maxSize, assumeStringKey});
  }
}
