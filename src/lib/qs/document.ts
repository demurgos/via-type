import { createInvalidDocumentError } from "../errors/invalid-document";
import { Serializer } from "../types";
import { DocumentType, name as typeName, PropertyDescriptor, renameKeys } from "../types/document";

export function register(serializer: Serializer): void {
  function write<T extends {}>(type: DocumentType<T>, val: T): any {
    const result: any = Object.create(null);
    for (const [key, outKey] of renameKeys(type.properties, type.rename)) {
      const descriptor: PropertyDescriptor<T[keyof T]> = type.properties[key];
      const value: T[keyof T] = val[key];
      if (value === undefined) {
        Reflect.set(result, outKey, undefined);
      } else {
        Reflect.set(result, outKey, serializer.write(descriptor.type, value));
      }
    }
    return result as T;
  }

  function read<T extends {}>(type: DocumentType<T>, input: any): T {
    const extra: Set<string> | undefined = type.ignoreExtraKeys ? undefined : new Set(Object.keys(input));
    const missing: Set<string> = new Set();
    const invalid: Map<keyof T, Error> = new Map();

    const result: Partial<T> = Object.create(null);

    for (const [key, outKey] of renameKeys(type.properties, type.rename)) {
      if (extra !== undefined) {
        extra.delete(outKey);
      }
      const descriptor: PropertyDescriptor<any> = type.properties[key];
      const outValue: any = Reflect.get(input, outKey);
      if (outValue === undefined) {
        if (descriptor.optional) {
          result[key] = undefined;
        } else {
          missing.add(key);
        }
        continue;
      }
      try {
        result[key] = serializer.read(descriptor.type, outValue);
      } catch (err) {
        invalid.set(key, err);
      }
    }

    if (extra !== undefined && extra.size > 0 || missing.size > 0 || invalid.size > 0) {
      throw createInvalidDocumentError({extra, missing, invalid});
    }
    return result as T;
  }

  function readTrusted<T extends {}>(type: DocumentType<T>, input: any): T {
    const result: Partial<T> = Object.create(null);
    for (const [key, outKey] of renameKeys(type.properties, type.rename)) {
      const descriptor: PropertyDescriptor<any> = type.properties[key];
      const outValue: any = Reflect.get(input, outKey);
      if (outValue === undefined) {
        result[key] = undefined;
      } else {
        result[key] = serializer.readTrusted(descriptor.type, outValue);
      }
    }
    return result as T;
  }

  serializer.register({
    typeName,
    write,
    read,
    readTrusted,
  });
}
