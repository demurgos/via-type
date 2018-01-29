import { Incident } from "incident";
import { lazyProperties } from "../_helpers/lazy-properties";
import { CaseStyle, rename } from "../case-style";
import { createInvalidDocumentError } from "../errors/invalid-document";
import { createInvalidTypeError } from "../errors/invalid-type";
import { createNotImplementedError } from "../errors/not-implemented";
import { JSON_SERIALIZER } from "../json";
import { Lazy, Type as KryoType, VersionedType } from "../types";

export type Name = "document";
export const name: Name = "document";
export namespace json {
  export interface Type {
    name: Name;
  }
}

export interface Diff<T> {
  set: {[P in keyof T]?: any}; // val
  update: {[P in keyof T]?: any}; // diff
  unset: {[P in keyof T]?: any}; // val
}

export interface DocumentTypeOptions<T> {
  /**
   * Do not throw error when the object contains extraneous keys.
   */
  ignoreExtraKeys?: boolean;

  /**
   * A dictionary between a property name and its description.
   */
  properties: {[P in keyof T]: PropertyDescriptor<KryoType<T[P]>>};

  /**
   * The keys of the serialized documents are renamed following the
   * supplied style (undefined to keep the original name).
   */
  rename?: CaseStyle;
}

export interface PropertyDescriptor<MetaType extends KryoType<any>> {
  /**
   * Allows this property to be missing (undefined values throw errors).
   */
  optional?: boolean;

  /**
   * The type of this property.
   */
  type: MetaType;
}

export interface DocumentTypeConstructor {
  new<T>(options: Lazy<DocumentTypeOptions<T>>): DocumentType<T>;
}

export interface DocumentType<T> extends VersionedType<T, any, any, Diff<T>>, DocumentTypeOptions<T> {

}

// tslint:disable-next-line:variable-name
export const DocumentType: DocumentTypeConstructor = class<T extends {}> {
  readonly name: Name = name;
  readonly ignoreExtraKeys: boolean;
  readonly properties: {[P in keyof T]: PropertyDescriptor<KryoType<T[P]>>};
  readonly rename?: CaseStyle;

  /**
   * Map from the document keys to the serialized names
   */
  private readonly keys: Map<keyof T, string>;

  private _options: Lazy<DocumentTypeOptions<T>>;

  constructor(options: Lazy<DocumentTypeOptions<T>>) {
    // TODO: Remove once TS 2.7 is better supported by editors
    this.ignoreExtraKeys = <any> undefined;
    this.properties = <any> undefined;
    this.keys = <any> undefined;

    this._options = options;
    if (typeof options !== "function") {
      this._applyOptions();
    } else {
      lazyProperties(
        this,
        this._applyOptions,
        ["ignoreExtraKeys", "properties", "rename", "keys"],
      );
    }
  }

  static fromJSON(options: json.Type): DocumentType<{}> {
    throw createNotImplementedError("DocumentType.fromJSON");
  }

  toJSON(): json.Type {
    throw createNotImplementedError("DocumentType#toJSON");
  }

  readTrustedJson(input: any): T {
    const result: Partial<T> = Object.create(null);
    for (const [key, outKey] of this.keys) {
      const descriptor: PropertyDescriptor<any> = this.properties[key];
      const jsonValue: any = Reflect.get(input, outKey);
      if (jsonValue === undefined) {
        result[key] = undefined;
      } else {
        result[key] = JSON_SERIALIZER.readTrusted(descriptor.type, jsonValue);
      }
    }
    return result as T;
  }

  readJson(input: any): T {
    const extra: Set<string> | undefined = this.ignoreExtraKeys ? undefined : new Set(Object.keys(input));
    const missing: Set<string> = new Set();
    const invalid: Map<keyof T, Error> = new Map();

    const result: Partial<T> = Object.create(null);

    for (const [key, outKey] of this.keys) {
      if (extra !== undefined) {
        extra.delete(outKey);
      }
      const descriptor: PropertyDescriptor<any> = this.properties[key];
      const jsonValue: any = Reflect.get(input, outKey);
      if (jsonValue === undefined) {
        if (descriptor.optional) {
          result[key] = undefined;
        } else {
          missing.add(key);
        }
        continue;
      }
      try {
        result[key] = JSON_SERIALIZER.read(descriptor.type, jsonValue);
      } catch (err) {
        invalid.set(key, err);
      }
    }

    if (extra !== undefined && extra.size > 0 || missing.size > 0 || invalid.size > 0) {
      throw createInvalidDocumentError({extra, missing, invalid});
    }
    return result as T;
  }

  writeJson(val: T): any {
    const result: any = Object.create(null);
    for (const [key, outKey] of this.keys) {
      const descriptor: PropertyDescriptor<T[keyof T]> = this.properties[key];
      const value: T[keyof T] = val[key];
      if (value === undefined) {
        Reflect.set(result, outKey, undefined);
      } else {
        Reflect.set(result, outKey, JSON_SERIALIZER.write(descriptor.type, value));
      }
    }
    return result as T;
  }

  testError(val: T): Error | undefined {
    if (typeof val !== "object" || val === null) {
      return createInvalidTypeError("object", val);
    }

    const extra: Set<string> | undefined = this.ignoreExtraKeys ? undefined : new Set(Object.keys(val));
    const missing: Set<string> = new Set();
    const invalid: Map<keyof T, Error> = new Map();

    for (const key in this.properties) {
      if (extra !== undefined) {
        extra.delete(key);
      }
      const descriptor: PropertyDescriptor<any> = this.properties[key];
      const propertyValue: any = val[key];
      if (propertyValue === undefined) {
        if (!descriptor.optional) {
          missing.add(key);
        }
        continue;
      }
      const error: Error | undefined = descriptor.type.testError(propertyValue);
      if (error !== undefined) {
        invalid.set(key, error);
      }
    }

    if (extra !== undefined && extra.size > 0 || missing.size > 0 || invalid.size > 0) {
      return createInvalidDocumentError({extra, missing, invalid});
    }
    return undefined;
  }

  test(val: T): val is T {
    if (typeof val !== "object" || val === null) {
      return false;
    }

    const extra: Set<string> | undefined = this.ignoreExtraKeys ? undefined : new Set(Object.keys(val));

    for (const key in this.properties) {
      if (extra !== undefined) {
        extra.delete(key);
      }
      const descriptor: PropertyDescriptor<any> = this.properties[key];
      const propertyValue: any = val[key];
      if (propertyValue === undefined) {
        if (!descriptor.optional) {
          return false;
        }
      } else if (!descriptor.type.test(propertyValue)) {
        return false;
      }
    }

    return extra === undefined || extra.size === 0;
  }

  equals(val1: T, val2: T): boolean {
    for (const key in this.properties) {
      const descriptor: PropertyDescriptor<KryoType<any>> = this.properties[key];
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
    const result: Partial<T> = Object.create(null);
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
      const descriptor: PropertyDescriptor<VersionedType<any, any, any, any>> = <any> this.properties[key];
      const oldMember: any = (<any> oldVal)[key];
      const newMember: any = (<any> newVal)[key];
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
      Reflect.deleteProperty(result, key);
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

  squash(diff1: Diff<T> | undefined, diff2: Diff<T> | undefined): Diff<T> | undefined {
    throw createNotImplementedError("DocumentType#squash");
  }

  private _applyOptions(): void {
    if (this._options === undefined) {
      throw new Incident("No pending options");
    }
    const options: DocumentTypeOptions<T> = typeof this._options === "function" ?
      this._options() :
      this._options;

    const ignoreExtraKeys: boolean = options.ignoreExtraKeys || false;
    const properties: {[P in keyof T]: PropertyDescriptor<KryoType<any>>} = options.properties;
    const renameAll: CaseStyle | undefined = options.rename;
    const keys: Map<keyof T, string> = renameKeys(properties, renameAll);

    Object.assign(this, {ignoreExtraKeys, properties, rename: renameAll, keys});
    Object.freeze(this);
  }
};

export function renameKeys<T>(obj: T, renameAll?: CaseStyle): Map<keyof T, string> {
  const keys: (keyof T)[] = Object.keys(obj) as (keyof T)[];
  const result: Map<keyof T, string> = new Map();
  const outKeys: Set<string> = new Set();
  for (const key of keys) {
    const renamed: string = renameAll === undefined ? key : rename(key, renameAll);
    result.set(key, renamed);
    if (outKeys.has(renamed)) {
      throw new Incident("NonBijectiveKeyRename", "Some keys are the same after renaming");
    }
    outKeys.add(renamed);
  }
  return result;
}
