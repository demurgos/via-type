import {Incident} from "incident";
import {NotImplementedError} from "./_errors/not-implemented";
import {UnknownFormatError} from "./_errors/unknown-format";
import {WrongTypeError} from "./_errors/wrong-type";
import {SerializableType, VersionedType} from "./_interfaces";

export type Name = "map";
export const name: Name = "map";
export namespace bson {
  export interface Input {
    [key: string]: any;
  }
  export interface Output {
    [key: string]: any;
  }
}
export namespace json {
  export interface Input {
    [key: string]: any;
  }
  export interface Output {
    [key: string]: any;
  }
  // TODO(demurgos): Export arrayType to JSON
  export type Type = undefined;
}
export namespace qs {
  export interface Input {
    [key: string]: any;
  }
  export interface Output {
    [key: string]: any;
  }
}
export type Diff = any;

export interface Options<K, V> {
  keyType: VersionedType<K, any, any, any>;
  valueType: VersionedType<V, any, any, any>;
  maxSize: number;
  assumeStringKey?: boolean;
}

export class MapType<K, V>
  implements VersionedType<Map<K, V>, json.Input, json.Output, Diff>,
    SerializableType<Map<K, V>, "bson", bson.Input, bson.Output>,
    SerializableType<Map<K, V>, "qs", qs.Input, qs.Output> {
  readonly name: Name = name;
  readonly keyType: VersionedType<K, any, any, any>;
  readonly valueType: VersionedType<V, any, any, any>;
  readonly maxSize: number;
  readonly assumeStringKey: boolean;

  constructor(options: Options<K, V>) {
    this.keyType = options.keyType;
    this.valueType = options.valueType;
    this.maxSize = options.maxSize;
    this.assumeStringKey = options.assumeStringKey || false;
  }

  toJSON(): json.Type {
    throw NotImplementedError.create("MapType#toJSON");
  }

  readTrusted(format: "bson", val: bson.Output): Map<K, V>;
  readTrusted(format: "json", val: json.Output): Map<K, V>;
  readTrusted(format: "qs", val: qs.Output): Map<K, V>;
  readTrusted(format: "bson" | "json" | "qs", input: any): Map<K, V> {
    switch (format) {
      case "bson":
      case "json":
      case "qs":
        const result: Map<K, V> = new Map();
        for (const keyString in input) {
          const key: K = this.keyType.readTrusted("json", JSON.parse(keyString));
          // TODO(demurgos): Check if the format is supported instead of casting to `any`
          const value: V = this.valueType.readTrusted(<any> format, input[keyString]);
          result.set(key, value);
        }
        return result;
      default:
        return undefined as never;
    }
  }

  read(format: "bson" | "json" | "qs", input: any): Map<K, V> {
    if (typeof input !== "object" || input === null) {
      throw WrongTypeError.create("object", input);
    }
    const result: Map<K, V> = new Map();
    switch (format) {
      case "bson":
      case "json":
      case "qs":
        for (const keyString in input) {
          let rawKey: any;
          try {
            rawKey = JSON.parse(keyString);
          } catch (err) {
            throw err;
          }
          const key: K = this.keyType.read("json", rawKey);
          // TODO(demurgos): Check if the format is supported instead of casting to `any`
          const value: V = this.valueType.read(<any> format, input[keyString]);
          result.set(key, value);
        }
        break;
      default:
        throw UnknownFormatError.create(format);
    }
    const error: Error | undefined = this.testError(result);
    if (error !== undefined) {
      throw error;
    }
    return result;
  }

  write(format: "bson", val: Map<K, V>): bson.Output;
  write(format: "json", val: Map<K, V>): json.Output;
  write(format: "qs", val: Map<K, V>): qs.Output;
  write(format: "bson" | "json" | "qs", val: Map<K, V>): any {
    switch (format) {
      case "bson":
      case "json":
      case "qs":
        const result: {[key: string]: any} = {};
        for (const [key, value] of val) {
          const rawKey: any = this.keyType.write("json", key);
          const keyString: string = JSON.stringify(rawKey);
          // TODO(demurgos): check for duplicate keys
          // TODO(demurgos): Check if the format is supported instead of casting to `any`
          result[keyString] = this.valueType.write(<any> format, value);
        }
        return result;
      default:
        return undefined as never;
    }
  }

  testError(val: Map<K, V>): Error | undefined {
    if (!(val instanceof Map)) {
      return WrongTypeError.create("Map", val);
    }
    for (const [key, value] of val) {
      // TODO: test keyType
      const keyError: Error | undefined = this.keyType.testError(key);
      if (keyError !== undefined) {
        return new Incident("InvalidMapKey", {key, value}, "Invalid map entry: invalid key");
      }
      const valueError: Error | undefined = this.valueType.testError(value);
      if (valueError !== undefined) {
        return new Incident("InvalidMapValue", {key, value}, "Invalid map entry: invalid value");
      }
    }
    return undefined;
  }

  test(val: Map<K, V>): boolean {
    return this.testError(val) === undefined;
  }

  equals(val1: Map<K, V>, val2: Map<K, V>): boolean {
    if (val2.size !== val1.size) {
      return false;
    }
    // TODO(demurgos): This test is brittle (order-sensitive) and involves unnecessary serialization.
    const val1Json: string = JSON.stringify(this.write("json", val1));
    const val2Json: string = JSON.stringify(this.write("json", val2));
    return val1Json === val2Json;
  }

  clone(val: Map<K, V>): Map<K, V> {
    const result: Map<K, V> = new Map();
    for (const [key, value] of val) {
      const keyClone: K = this.keyType.clone(key);
      const valueClone: V = this.valueType.clone(value);
      result.set(key, value);
    }
    return result;
  }

  diff(oldVal: Map<K, V>, newVal: Map<K, V>): Diff | undefined {
    throw NotImplementedError.create("MapType#diff");
  }

  patch(oldVal: Map<K, V>, diff: Diff | undefined): Map<K, V> {
    throw NotImplementedError.create("MapType#patch");
  }

  reverseDiff(diff: Diff | undefined): Diff | undefined {
    throw NotImplementedError.create("MapType#reverseDiff");
  }

  squash(diff1: Diff | undefined, diff2: Diff | undefined): Diff | undefined {
    throw NotImplementedError.create("MapType#squash");
  }
}

export {MapType as Type};
