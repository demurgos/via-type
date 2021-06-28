import incident from "incident";

import { lazyProperties } from "./_helpers/lazy-properties.js";
import { testError } from "./_helpers/test-error.js";
import { createInvalidTypeError } from "./errors/invalid-type.js";
import { createLazyOptionsError } from "./errors/lazy-options.js";
import { createNotImplementedError } from "./errors/not-implemented.js";
import { IoType, Lazy, Reader, VersionedType, Writer } from "./index.js";
import { readVisitor } from "./readers/read-visitor.js";

export type Name = "map";
export const name: Name = "map";
export type Diff = any;

export interface MapTypeOptions<K, V> {
  keyType: VersionedType<K, any>;
  valueType: VersionedType<V, any>;
  maxSize: number;
  assumeStringKey?: boolean;
}

export class MapType<K, V> implements IoType<Map<K, V>>, VersionedType<Map<K, V>, Diff> {
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

  // TODO: Dynamically add with prototype?
  read<R>(reader: Reader<R>, raw: R): Map<K, V> {
    if (this.assumeStringKey) {
      return reader.readRecord(raw, readVisitor({
        fromMap: <RK, RV>(input: Map<RK, RV>, keyReader: Reader<RK>, valueReader: Reader<RV>): Map<K, V> => {
          const result: Map<K, V> = new Map();

          for (const [rawKey, rawValue] of input) {
            const uncheckedKey: string = keyReader.readString(
              rawKey,
              readVisitor({fromString: (input: string): string => input}),
            );
            const keyErr: Error | undefined = this.keyType.testError!(uncheckedKey as any);
            if (keyErr !== undefined) {
              throw keyErr;
            }
            const key: K = uncheckedKey as any;
            const value: V = this.valueType.read!(valueReader, rawValue);
            result.set(key, value);
          }

          const error: Error | undefined = this.testError(result);
          if (error !== undefined) {
            throw error;
          }
          return result;
        },
      }));
    }

    return reader.readMap(raw, readVisitor({
      fromMap: <RK, RV>(input: Map<RK, RV>, keyReader: Reader<RK>, valueReader: Reader<RV>): Map<K, V> => {
        const result: Map<K, V> = new Map();
        for (const [rawKey, rawValue] of input) {
          const key: K = this.keyType.read!(keyReader, rawKey);
          const value: V = this.valueType.read!(valueReader, rawValue);
          result.set(key, value);
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
  write<W>(writer: Writer<W>, value: Map<K, V>): W {
    if (this.assumeStringKey) {
      return writer.writeRecord(
        value.keys() as Iterable<any> as Iterable<string>,
        <FW>(outKey: string, fieldWriter: Writer<FW>): FW => {
          return this.valueType.write!(fieldWriter, value.get(outKey as any)!);
        },
      );
    }

    const entries: [K, V][] = [...value];

    return writer.writeMap(
      entries.length,
      <KW>(index: number, keyWriter: Writer<KW>): KW => {
        if (this.keyType.write === undefined) {
          throw new incident.Incident("NotWritable", {type: this.keyType});
        }
        return this.keyType.write(keyWriter, entries[index][0]);
      },
      <VW>(index: number, valueWriter: Writer<VW>): VW => {
        if (this.valueType.write === undefined) {
          throw new incident.Incident("NotWritable", {type: this.valueType});
        }
        return this.valueType.write(valueWriter, entries[index][1]);
      },
    );
  }

  testError(val: unknown): Error | undefined {
    if (!(val instanceof Map)) {
      return createInvalidTypeError("Map", val);
    }
    if (val.size > this.maxSize) {
      return new incident.Incident("MaxMapSize", {maxSize: this.maxSize, actualSize: val.size}, "Invalid map: max size exceeded");
    }
    for (const [key, value] of val) {
      const keyError: Error | undefined = testError(this.keyType, key);
      if (keyError !== undefined) {
        return new incident.Incident("InvalidMapKey", {key, value}, "Invalid map entry: invalid key");
      }
      const valueError: Error | undefined = testError(this.valueType, value);
      if (valueError !== undefined) {
        return new incident.Incident("InvalidMapValue", {key, value}, "Invalid map entry: invalid value");
      }
    }
    return undefined;
  }

  test(val: unknown): val is Map<K, V> {
    if (!(val instanceof Map)) {
      return false;
    }
    if (val.size > this.maxSize) {
      return false;
    }
    for (const [key, value] of val) {
      if (!this.keyType.test(key) || !this.valueType.test(value)) {
        return false;
      }
    }
    return true;
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

  diff(_oldVal: Map<K, V>, _newVal: Map<K, V>): Diff | undefined {
    throw createNotImplementedError("MapType#diff");
  }

  patch(_oldVal: Map<K, V>, _diff: Diff | undefined): Map<K, V> {
    throw createNotImplementedError("MapType#patch");
  }

  reverseDiff(_diff: Diff | undefined): Diff | undefined {
    throw createNotImplementedError("MapType#reverseDiff");
  }

  squash(_diff1: Diff | undefined, _diff2: Diff | undefined): Diff | undefined {
    throw createNotImplementedError("MapType#squash");
  }

  private _applyOptions(): void {
    if (this._options === undefined) {
      throw createLazyOptionsError(this);
    }
    const options: MapTypeOptions<K, V> = typeof this._options === "function" ? this._options() : this._options;

    const keyType: VersionedType<K, any> = options.keyType;
    const valueType: VersionedType<V, any> = options.valueType;
    const maxSize: number = options.maxSize;
    const assumeStringKey: boolean = options.assumeStringKey || false;

    Object.assign(this, {keyType, valueType, maxSize, assumeStringKey});
  }
}
