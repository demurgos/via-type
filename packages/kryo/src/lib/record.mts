import { rename } from "./_helpers/case-style.mjs";
import { lazyProperties } from "./_helpers/lazy-properties.mjs";
import {writeError} from "./_helpers/write-error.mjs";
import {AggregateCheck} from "./checks/aggregate.mjs";
import {CheckKind} from "./checks/check-kind.mjs";
import {PropertyKeyCheck} from "./checks/property-key.mjs";
import {PropertyValueCheck} from "./checks/property-value.mjs";
import {
  CaseStyle,
  CheckId,
  IoType,
  KryoContext,
  Lazy,
  Reader,
  Result,
  Type,
  VersionedType,
  Writer
} from "./index.mjs";
import { readVisitor } from "./readers/read-visitor.mjs";
import {AnyKey} from "./ts-enum.mjs";

export type Name = "record";
export const name: Name = "record";

export interface Diff<T> {
  set: {[P in keyof T]?: any}; // val
  update: {[P in keyof T]?: any}; // diff
  unset: {[P in keyof T]?: any}; // val
}

export interface RecordTypeOptions<T> {
  /**
   * Treat values with extra keys as invalid.
   */
  noExtraKeys?: boolean;

  /**
   * A dictionary between a property name and its description.
   */
  properties: {readonly [P in keyof T]: PropertyDescriptor<T[P], Type<T[P]>>};

  /**
   * The keys of the serialized records are renamed following the
   * supplied style (undefined to keep the original name).
   */
  changeCase?: CaseStyle;

  rename?: {readonly [P in keyof T]?: string};
}

export interface RecordIoTypeOptions<T> extends RecordTypeOptions<T> {
  properties: {readonly [P in keyof T]: PropertyDescriptor<T[P], IoType<T[P]>>};
}

export interface PropertyDescriptor<T, K extends Type<T> = Type<T>> {
  /**
   * Allows this property to be missing (undefined values throw errors).
   */
  optional?: boolean;

  /**
   * The type of this property.
   */
  type: K;

  /**
   * The key in the serialized records will be automatically renamed with the provided
   * case style.
   */
  changeCase?: CaseStyle;

  /**
   * The name of the key used in the serialized records.
   * TODO: Remove in favor of `rename` of the property descriptor
   */
  rename?: string;
}

export interface ExtendRecordTypeOptions<E> {
  /**
   * A dictionary between a property name and its description.
   */
  properties: {readonly [P in keyof E]: PropertyDescriptor<E[P], Type<E[P]>>};

  rename?: {readonly [P in keyof E]?: string};
}

export interface ExtendRecordIoTypeOptions<E> extends ExtendRecordTypeOptions<E> {
  properties: {readonly [P in keyof E]: PropertyDescriptor<E[P], IoType<E[P]>>};
}

export interface RecordTypeConstructor {
  new<T>(options: Lazy<RecordIoTypeOptions<T>>): RecordIoType<T>;

  /**
   * Create a new record type checking for objects with the supplied properties.
   *
   * The generic type `T` is the interface described by this instance.
   *
   * @param options Options describing this record type.
   * @return The record type corresponding to the provided options
   */
  new<T>(options: Lazy<RecordTypeOptions<T>>): RecordType<T>;
}

export interface RecordType<T> extends Type<T>, VersionedType<T, Diff<T>>, RecordTypeOptions<T> {
  getOutKey(key: keyof T): string;

  pick<K extends keyof T>(keys: readonly K[]): RecordType<Pick<T, K>>;

  omit<K extends keyof T>(keys: readonly K[]): RecordType<Omit<T, K>>;

  extend<E>(options: Lazy<ExtendRecordTypeOptions<E>>): RecordType<T & E>;
}

// tslint:disable-next-line:max-line-length
export interface RecordIoType<T> extends IoType<T>, VersionedType<T, Diff<T>>, RecordIoTypeOptions<T> {
  getOutKey(key: keyof T): string;

  read<R>(cx: KryoContext, reader: Reader<R>, raw: R): Result<T, CheckId>;

  write<W>(writer: Writer<W>, value: T): W;

  pick<K extends keyof T>(keys: readonly K[]): RecordIoType<Pick<T, K>>;

  omit<K extends keyof T>(keys: readonly K[]): RecordIoType<Omit<T, K>>;

  extend<E>(options: Lazy<ExtendRecordIoTypeOptions<E>>): RecordIoType<T & E>;
  extend<E>(options: Lazy<ExtendRecordTypeOptions<E>>): RecordType<T & E>;
}

// We use an `any` cast because of the `properties` property.
// tslint:disable-next-line:variable-name
export const RecordType: RecordTypeConstructor = (class<T> implements IoType<T>,
  RecordIoTypeOptions<T> {
  readonly name: Name = name;
  readonly noExtraKeys?: boolean;
  readonly properties!: {readonly [P in keyof T]: PropertyDescriptor<T[P], any>};
  readonly rename?: {readonly [P in keyof T]?: string};
  readonly changeCase?: CaseStyle;
  private _options: Lazy<RecordTypeOptions<T>>;
  private _outKeys: Map<string, keyof T> | undefined;

  constructor(options: Lazy<RecordTypeOptions<T>>) {
    this._options = options;
    if (typeof options !== "function") {
      this._applyOptions();
    } else {
      lazyProperties(this, this._applyOptions, ["noExtraKeys", "properties", "changeCase", "rename" as keyof this]);
    }
  }

  /**
   * Map from serialized keys to the record keys
   */
  get outKeys(): Map<string, keyof T> {
    if (this._outKeys === undefined) {
      this._outKeys = new Map();
      for (const key of Object.keys(this.properties) as (keyof T)[]) {
        this._outKeys.set(this.getOutKey(key), key);
      }
    }
    return this._outKeys;
  }

  getOutKey(key: keyof T): string {
    if (typeof key !== "string") {
      throw new Error(`NonStringKey: ${String(key)}`);
    }
    const descriptor: PropertyDescriptor<any> = this.properties[key];
    if (descriptor.rename !== undefined) {
      return descriptor.rename;
    } else if (descriptor.changeCase !== undefined) {
      return rename(key as string, descriptor.changeCase);
    }
    if (this.rename !== undefined && this.rename[key] !== undefined) {
      return this.rename[key]!;
    } else if (this.changeCase !== undefined) {
      return rename(key as string, this.changeCase);
    }
    return key;
  }

  read<R>(cx: KryoContext, reader: Reader<R>, raw: R): Result<T, CheckId> {
    return reader.readRecord(cx, raw, readVisitor({
      fromMap: <RK, RV>(input: Map<RK, RV>, keyReader: Reader<RK>, valueReader: Reader<RV>): Result<T, CheckId> => {
        const extra: Set<string> = new Set();
        const missing: Set<string> = new Set();
        for (const key in this.properties) {
          const descriptor: PropertyDescriptor<any> = this.properties[key];
          if (!descriptor.optional) {
            missing.add(key);
          }
        }
        const invalid: Map<AnyKey, CheckId> = new Map();
        const result: Partial<T> = Object.create(null);

        for (const [rawKey, rawValue] of input) {
          const {ok: okOutKey, value: outKey} =  keyReader.readString(
            cx,
            rawKey,
            readVisitor({fromString: (value: string): Result<string, CheckId> => ({ok: true, value})}),
          );
          if (!okOutKey) {
            return writeError(cx, {check: CheckKind.PropertyKey} satisfies PropertyKeyCheck);
          }
          const key: keyof T | undefined = this.outKeys.get(outKey);
          if (key === undefined) {
            // Extra key
            extra.add(outKey);
            continue;
          }
          missing.delete(key as string);
          const descriptor: PropertyDescriptor<any> = this.properties[key];
          // TODO: Update readers so `undefined` is impossible/not handled here
          if (rawValue === undefined) {
            if (descriptor.optional) {
              result[key] = undefined;
            } else {
              missing.add(key as string);
            }
            continue;
          }
          const {ok, value} = cx.enter(key, () => descriptor.type.read!(cx, valueReader, rawValue));
          if (!ok) {
            invalid.set(key, value);
          } else {
            result[key] = value;
          }
        }

        if (this.noExtraKeys && extra.size > 0 || missing.size > 0) {
          return writeError(cx, {check: CheckKind.PropertyKey} satisfies PropertyKeyCheck);
          // throw createInvalidRecordError({extra, missing, invalid});
        }
        if (invalid.size > 0) {
          return writeError(cx, {check: CheckKind.Aggregate, children: [...invalid.values()]} satisfies AggregateCheck);
        }
        return {ok: true, value: result as T};
      },
    }));
  }

  // TODO: Dynamically add with prototype?
  write<W>(writer: Writer<W>, value: T): W {
    const outKeys: Map<string, keyof T> = new Map(this.outKeys);

    for (const [outKey, jskey] of outKeys) {
      if (value[jskey] === undefined) {
        outKeys.delete(outKey);
      }
    }

    return writer.writeRecord(outKeys.keys(), <FW,>(outKey: string, fieldWriter: Writer<FW>): FW => {
      const jsKey: keyof T = this.outKeys.get(outKey)!;
      const descriptor: PropertyDescriptor<any> = this.properties[jsKey];
      if (descriptor.type.write === undefined) {
        throw new Error(`write is not supported for Record with non-readable key ${String(jsKey)} with type ${descriptor.type.name}`);
      }
      return descriptor.type.write(fieldWriter, value[jsKey]);
    });
  }

  test(cx: KryoContext, value: unknown): Result<T, CheckId> {
    if (typeof value !== "object" || value === null) {
      return writeError(cx, {check: CheckKind.BaseType, expected: ["Record"]});
    }

    const extra: Set<string> | undefined = this.noExtraKeys ? new Set(Object.keys(value)) : undefined;

    for (const key in this.properties) {
      if (extra !== undefined) {
        extra.delete(key);
      }
      const descriptor: PropertyDescriptor<any> = this.properties[key];
      const propertyValue: unknown = Reflect.get(value, key);
      if (propertyValue === undefined) {
        if (!descriptor.optional) {
          return writeError(cx, {check: CheckKind.PropertyKey} satisfies PropertyKeyCheck);
          // return false;
        }
      } else {
        const {ok: okProp, value: propValue} = descriptor.type.test(cx, propertyValue);
        if (!okProp) {
          return writeError(cx, {check: CheckKind.PropertyValue, children: [propValue]} satisfies PropertyValueCheck);
        }
      }
    }
    const isOk = extra === undefined || extra.size === 0;
    if (!isOk) {
      return writeError(cx, {check: CheckKind.PropertyKey} satisfies PropertyKeyCheck);
    }
    return {ok: true, value: value as T};
  }

  equals(val1: T, val2: T): boolean {
    for (const key in this.properties) {
      const descriptor: PropertyDescriptor<any> = this.properties[key];
      if (!descriptor.optional) {
        if (!descriptor.type.equals(val1[key], val2[key])) {
          return false;
        }
        continue;
      }
      if (val1[key] === undefined && val2[key] === undefined) {
        continue;
      }
      if (val1[key] === undefined || val2[key] === undefined || !descriptor.type.equals(val1[key], val2[key])) {
        return false;
      }
    }
    return true;
  }

  clone(val: T): T {
    const result: Partial<T> = {}; // Object.create(null);
    for (const key in this.properties) {
      result[key] = val[key] === undefined ? undefined : this.properties[key].type.clone(val[key]);
    }
    return result as T;
  }

  diff(oldVal: T, newVal: T): Diff<T> | undefined {
    let equal: boolean = true;
    const result: Diff<T> = {set: {}, unset: {}, update: {}};
    for (const key in this.properties) {
      // TODO: Remove cast
      const descriptor: PropertyDescriptor<any, VersionedType<any, any>> = this.properties[key] as any;
      const oldMember: any = (oldVal as any)[key];
      const newMember: any = (newVal as any)[key];
      if (oldMember !== undefined) {
        if (newMember !== undefined) {
          const diff: any = descriptor.type.diff(oldMember, newMember);
          if (diff !== undefined) {
            result.update[key] = diff;
            equal = false;
          }
        } else {
          result.unset[key] = descriptor.type.clone(oldMember);
          equal = false;
        }
      } else {
        if (newMember === undefined) {
          result.set[key] = descriptor.type.clone(newMember);
          equal = false;
        }
      }
    }
    return equal ? undefined : result;
  }

  patch(oldVal: T, diff: Diff<T> | undefined): T {
    const result: T = this.clone(oldVal);
    if (diff === undefined) {
      return result;
    }
    for (const key in diff.set) {
      result[key] = this.properties[key].type.clone(diff.set[key]);
    }
    for (const key in diff.unset) {
      Reflect.deleteProperty(result as any as object, key);
    }
    for (const key in diff.update) {
      // TODO: Remove cast
      result[key] = (this.properties[key].type as any).patch(result[key], diff.update[key]);
    }
    return result;
  }

  reverseDiff(diff: Diff<T> | undefined): Diff<T> | undefined {
    if (diff === undefined) {
      return undefined;
    }
    const result: Diff<T> = {set: {}, unset: {}, update: {}};
    for (const key in diff.unset) {
      result.set[key] = this.properties[key].type.clone(diff.unset[key]);
    }
    for (const key in diff.set) {
      result.unset[key] = this.properties[key].type.clone(diff.set[key]);
    }
    for (const key in diff.update) {
      // TODO: Remove cast
      result.update[key] = (this.properties[key].type as any).reverseDiff(diff.update[key]);
    }
    return result;
  }

  squash(prev: Diff<T> | undefined, next: Diff<T> | undefined): Diff<T> | undefined {
    if (prev === undefined) {
      return next;
    } else if (next === undefined) {
      return prev;
    }
    const diff: Diff<T> = {set: {}, update: {}, unset: {}};
    const handled: Set<AnyKey> = new Set();
    for (const [key, nextSet] of Object.entries<T>(next.set)) {
      const descriptor = Reflect.get(this.properties, key);
      if (descriptor === undefined) {
        throw new Error(`unknown key ${key} in record diff`);
      }
      if (Reflect.has(prev.unset, key)) {
        const prevUnset = Reflect.get(prev.unset, key);
        const diff = descriptor.type.diff(prevUnset, nextSet);
        Reflect.set(diff.update, key, diff);
      } else {
        Reflect.set(diff.set, key, nextSet);
      }
      handled.add(key);
    }
    for (const [key, nextUnset] of Object.entries<T>(next.unset)) {
      const descriptor = Reflect.get(this.properties, key);
      if (descriptor === undefined) {
        throw new Error(`unknown key ${key} in record diff`);
      }
      if (!Reflect.has(prev.set, key)) {
        Reflect.set(diff.unset, key, nextUnset);
      }
      handled.add(key);
    }
    for (const [key, nextUpdate] of Object.entries<T>(next.update)) {
      const descriptor = Reflect.get(this.properties, key);
      if (descriptor === undefined) {
        throw new Error(`unknown key ${key} in record diff`);
      }
      if (Reflect.has(prev.set, key)) {
        const prevSet = Reflect.get(prev.set, key);
        const nextSet = descriptor.type.apply(prevSet, nextUpdate);
        Reflect.set(diff.set, key, nextSet);
      } else if (Reflect.has(prev.update, key)) {
        const prevUpdate = Reflect.get(prev.update, key);
        const diff = descriptor.type.squash(prevUpdate, nextUpdate);
        Reflect.set(diff.update, key, diff);
      } else {
        Reflect.set(diff.update, key, diff);
      }
      handled.add(key);
    }
    for (const [key, prevSet] of Object.entries(prev.set)) {
      if (!handled.has(key)) {
        Reflect.set(diff.set, key, prevSet);
      }
    }
    for (const [key, prevUpdate] of Object.entries(prev.update)) {
      if (!handled.has(key)) {
        Reflect.set(diff.update, key, prevUpdate);
      }
    }
    for (const [key, prevUnet] of Object.entries(prev.unset)) {
      if (!handled.has(key)) {
        Reflect.set(diff.unset, key, prevUnet);
      }
    }
    if (Object.keys(diff.set).length === 0 && Object.keys(diff.unset).length === 0 && Object.keys(diff.update).length === 0) {
      return undefined;
    }
    return diff;
  }

  private _applyOptions(): void {
    if (this._options === undefined) {
      throw new Error("missing `_options` for lazy initialization");
    }
    const options: RecordTypeOptions<T> = typeof this._options === "function" ?
      this._options() :
      this._options;

    const noExtraKeys: boolean | undefined = options.noExtraKeys;
    const properties: {[P in keyof T]: PropertyDescriptor<any>} = options.properties;
    const rename: {[P in keyof T]?: string} | undefined = options.rename;
    const changeCase: CaseStyle | undefined = options.changeCase;

    Object.assign(this, {noExtraKeys, properties, rename, changeCase});
  }

  pick<K extends keyof T>(keys: readonly K[]): RecordType<Pick<T, K>> {
    const keySet: ReadonlySet<K> = new Set(keys);

    return new RecordType(() => {
      const parentOptions: RecordTypeOptions<T> = typeof this._options === "function" ?
        this._options() :
        this._options;

      const properties = {};
      for (const key in parentOptions.properties) {
        if (keySet.has(key as any)) {
          Reflect.set(properties, key, parentOptions.properties[key]);
        }
      }

      const options: RecordTypeOptions<Pick<T, K>> = {
        ...parentOptions,
        properties: properties as {[P in keyof Pick<T, K>]: PropertyDescriptor<any>},
      };
      return options;
    });
  }

  omit<K extends keyof T>(keys: readonly K[]): RecordType<Omit<T, K>> {
    const keySet: ReadonlySet<K> = new Set(keys);

    return new RecordType(() => {
      const parentOptions: RecordTypeOptions<T> = typeof this._options === "function" ?
        this._options() :
        this._options;

      const properties = {};
      for (const key in parentOptions.properties) {
        if (!keySet.has(key as any)) {
          Reflect.set(properties, key, parentOptions.properties[key]);
        }
      }

      const options: RecordTypeOptions<Omit<T, K>> = {
        ...parentOptions,
        properties: properties as {[P in keyof Omit<T, K>]: PropertyDescriptor<any>},
      };
      return options;
    });
  }

  extend<E>(options: Lazy<ExtendRecordTypeOptions<E>>): RecordType<T & E> {
    return new RecordType(() => {
      const parentOptions: RecordTypeOptions<T> = typeof this._options === "function" ?
        this._options() :
        this._options;
      const extensionOptions: RecordTypeOptions<E> = typeof options === "function" ?
        options() :
        options;

      const properties = {...parentOptions.properties};
      for (const key in extensionOptions.properties) {
        if (Reflect.has(parentOptions.properties, key)) {
          throw new Error(`RecordExtensionPropertyConflict for key=${key}`);
        }
        Reflect.set(properties, key, extensionOptions.properties[key]);
      }

      type ResultRename = {[P in keyof (T & E)]?: string};
      let rename: ResultRename | undefined = undefined;
      if (parentOptions.rename === undefined) {
        if (extensionOptions.rename === undefined) {
          rename = undefined;
        } else {
          rename = extensionOptions.rename as ResultRename;
        }
      } else {
        if (extensionOptions.rename === undefined) {
          rename = parentOptions.rename as ResultRename;
        } else {
          rename = {...parentOptions.rename} as ResultRename;
          for (const key in extensionOptions.rename) {
            if (Reflect.has(parentOptions.rename, key)) {
              throw new Error(`RecordExtensionRenameConflict for key=${key}`);
            }
            Reflect.set(properties, key, extensionOptions.properties[key]);
          }
        }
      }

      const resultOptions: RecordTypeOptions<T & E> = {
        ...parentOptions,
        properties: properties as {[P in keyof (T & E)]: PropertyDescriptor<any>},
        rename,
      };
      return resultOptions;
    });
  }
}) as RecordTypeConstructor;

export function renameKeys<T extends {}>(obj: T, renameAll?: CaseStyle): Map<keyof T, string> {
  const keys: string[] = Object.keys(obj);
  const result: Map<keyof T, string> = new Map();
  const outKeys: Set<string> = new Set();
  for (const key of keys) {
    const renamed: string = renameAll === undefined ? key : rename(key, renameAll);
    result.set(key as keyof T, renamed);
    if (outKeys.has(renamed)) {
      throw new Error("NonBijectiveKeyRename: Some keys are the same after renaming");
    }
    outKeys.add(renamed);
  }
  return result;
}
