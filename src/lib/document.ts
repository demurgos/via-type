import * as _ from "lodash";
import {ExtraKeysError} from "./errors/extra-keys-error";
import {ForbiddenNullError} from "./errors/forbidden-null-error";
import {InvalidPropertiesError} from "./errors/invalid-properties-error";
import {MissingKeysError} from "./errors/missing-keys-error";
import {NotImplementedError} from "./errors/not-implemented-error";
import {
  Dictionary,
  Document,
  SerializableTypeAsync,
  SerializableTypeSync,
  Type,
  TypeBase,
  TypeSync,
  VersionedTypeAsync,
  VersionedTypeSync
} from "./interfaces";

export const NAME: string = "document";

// Configuration interfaces

export interface DocumentOptions<TypeKind extends TypeBase> {
  /**
   * Do not throw error when the object contains extraneous keys.
   */
  ignoreExtraKeys?: boolean;

  /**
   * A dictionary between a property name and its description.
   */
  properties: Dictionary<PropertyDescriptor<TypeKind>>;
}

export interface CompleteDocumentOptions<TypeKind extends TypeBase> extends DocumentOptions<TypeKind> {
  /**
   * Do not throw error when the object contains extraneous keys.
   */
  ignoreExtraKeys: boolean;
}

export interface PropertyDescriptor<TypeKind extends TypeBase> {
  /**
   * Allows this property to be missing (undefined values throw errors).
   */
  optional?: boolean;

  /**
   * Allows this property to be null.
   */
  nullable?: boolean;

  /**
   * The type of this property.
   */
    type: TypeKind;
}

export interface CompletePropertyDescriptor<TypeKind extends TypeBase> extends PropertyDescriptor<TypeKind> {
  /// This property can be missing
  optional: boolean;
  /// The value can be `null`
  nullable: boolean;
}

// End of configuration interfaces

export interface DocumentDiff {
  set: Document; // val
  update: Dictionary<any>; // diff
  unset: Document; // val
  toNull: Document;
  fromNull: Document;
}

export interface DiffKeysResult {
  commonKeys: string[];
  missingKeys: string[];
  extraKeys: string[];
}

function diffKeys(source: Document, target: Document): DiffKeysResult {
  const sourcetKeys: string[] = _.keys(source);
  const targetKeys: string[] = _.keys(target);

  return {
    commonKeys: _.intersection(sourcetKeys, targetKeys),
    missingKeys: _.difference(sourcetKeys, targetKeys),
    extraKeys: _.difference(targetKeys, sourcetKeys)
  };
}

export class DocumentType implements SerializableTypeSync<Document, "bson-doc", Document>,
  VersionedTypeSync<Document, Document, DocumentDiff>,
  SerializableTypeAsync<Document, "bson-doc", Document>,
  VersionedTypeAsync<Document, Document, DocumentDiff> {

  isSync: true;
  isAsync: true;
  isSerializable: true = true;
  isVersioned: true = true;
  isCollection: true = true;
  type: string = NAME;
  types: string[] = [NAME];

  options: CompleteDocumentOptions<any>;

  constructor(options: DocumentOptions<Type<any>>) {
    const properties: Dictionary<CompletePropertyDescriptor<any>> = {};
    for (const key in options.properties) {
      properties[key] = {
        optional: "optional" in options.properties[key] ? Boolean(options.properties[key].optional) : false,
        nullable: "nullable" in options.properties[key] ? Boolean(options.properties[key].nullable) : false,
        type: options.properties[key].type
      };
    }
    this.options = {
      ignoreExtraKeys: true,
      properties: properties
    };

    this.isSync = <any> _.reduce(options.properties, (memo, curProperty) => memo && curProperty.type.isSync, true);
    this.isAsync = <any> _.reduce(options.properties, (memo, curProperty) => memo && curProperty.type.isAsync, true);
  }

  toJSON(): null { // TODO: return options
    return null;
  }

  readTrustedSync(format: "json-doc", val: Document): Document;
  readTrustedSync(format: "bson-doc", val: Document): Document;
  readTrustedSync(format: any, val: any): any {
    return readTrustedSync(format, val, this.options);
  }

  async readTrustedAsync(format: "json-doc" | "bson-doc", val: Document): Promise<Document> {
    throw new NotImplementedError("Document:readTrustedAsync");
  }

  readSync(format: "json-doc", val: Document): Document;
  readSync(format: "bson-doc", val: Document): Document;
  readSync(format: any, val: any): any {
    return readSync(format, val, this.options);
  }

  async readAsync(format: "json-doc" | "bson-doc", val: Document): Promise<Document> {
    throw new NotImplementedError("Document:readAsync");
  }

  writeSync(format: "json-doc", val: Document): Document;
  writeSync(format: "bson-doc", val: Document): Document;
  writeSync(format: any, val: any): any {
    return writeSync(format, val, this.options);
  }

  async writeAsync(format: "json-doc" | "bson-doc", val: Document): Promise<Document> {
    throw new NotImplementedError("Document:writeAsync");
  }

  testErrorSync(val: Document): Error | null {
    return testErrorSync(val, this.options);
  }

  async testErrorAsync(val: Document): Promise<Error | null> {
    throw new NotImplementedError("Document:testErrorAsync");
  }

  testSync(val: Document): boolean {
    return testSync(val, this.options);
  }

  async testAsync(val: Document): Promise<boolean> {
    throw new NotImplementedError("Document:testAsync");
  }

  equalsSync(val1: Document, val2: Document): boolean {
    return equalsSync(val1, val2, this.options);
  }

  async equalsAsync(val1: Document, val2: Document): Promise<boolean> {
    throw new NotImplementedError("Document:equalsAsync");
  }

  cloneSync(val: Document): Document {
    return cloneSync(val, this.options);
  }

  async cloneAsync(val: Document): Promise<Document> {
    throw new NotImplementedError("Document:cloneAsync");
  }

  diffSync(oldVal: Document, newVal: Document): DocumentDiff | null {
    return diffSync(oldVal, newVal, this.options);
  }

  async diffAsync(oldVal: Document, newVal: Document): Promise<DocumentDiff | null> {
    throw new NotImplementedError("Document:diffAsync");
  }

  patchSync(oldVal: Document, diff: DocumentDiff | null): Document {
    return patchSync(oldVal, diff, this.options);
  }

  async patchAsync(oldVal: Document, diff: DocumentDiff | null): Promise<Document> {
    throw new NotImplementedError("Document:patchAsync");
  }

  reverseDiffSync(diff: DocumentDiff | null): DocumentDiff | null {
    return reverseDiffSync(diff, this.options);
  }

  async reverseDiffAsync(diff: DocumentDiff | null): Promise<DocumentDiff | null> {
    throw new NotImplementedError("Document:reverseDiffAsync");
  }

  iterateSync(value: Document): IteratorResult<any> {
    throw new Error("TODO");
  }

  async iterateAsync(value: Document): Promise<IteratorResult<Promise<any>>> {
    throw new NotImplementedError("Document:iterateAsync");
  }
}

function readSync(format: "json-doc",
                  val: Document,
                  options: CompleteDocumentOptions<SerializableTypeSync<"json-doc", any, any>>): Promise<Document>;
function readSync(format: "bson-doc",
                  val: Document,
                  options: CompleteDocumentOptions<SerializableTypeSync<"bson-doc", any, any>>): Promise<Document>;
function readSync(format: any, val: any, options: any): any {
  const keysDiff: DiffKeysResult = diffKeys(options.properties, val);

  const missingMandatoryKeys: string[] = _.filter(
    keysDiff.missingKeys,
    (key: string): boolean => {
      return !options.properties[key].optional;
    }
  );

  if (missingMandatoryKeys.length > 0) {
    throw new MissingKeysError(missingMandatoryKeys);
  } else if (keysDiff.extraKeys.length > 0 && options.ignoreExtraKeys) {
    throw new ExtraKeysError(keysDiff.extraKeys);
  }

  const result: Document = {};

  for (const key of keysDiff.commonKeys) {
    const member: any = val[key];
    // TODO: remove <any>
    const descriptor: PropertyDescriptor<any> = options.properties[key];
    if (member === null) {
      if (!descriptor.nullable) {
        throw new ForbiddenNullError(key);
      }
      result[key] = null;
    } else {
      result[key] = descriptor.type.readSync(format, member);
    }
  }

  return result;
}

// tslint:disable-next-line:max-line-length
function readTrustedSync(format: "json-doc", val: Document, options: CompleteDocumentOptions<SerializableTypeSync<"json-doc", any, any>>): Promise<Document>;
// tslint:disable-next-line:max-line-length
function readTrustedSync(format: "bson-doc", val: Document, options: CompleteDocumentOptions<SerializableTypeSync<"bson-doc", any, any>>): Promise<Document>;
function readTrustedSync(format: any, val: any, options: any): any {
  const keysDiff: DiffKeysResult = diffKeys(options.properties, val);

  const result: Document = {};

  for (const key of keysDiff.commonKeys) {
    const member: any = val[key];
    const descriptor: PropertyDescriptor<any> = options.properties[key];
    if (member === null) {
      result[key] = null;
    } else {
      result[key] = descriptor.type.readSync(format, member);
    }
  }

  return result;
}

function writeSync(format: "json-doc",
                   val: Document,
                   options: CompleteDocumentOptions<SerializableTypeSync<"json-doc", any, any>>): Promise<Document>;
function writeSync(format: "bson-doc",
                   val: Document,
                   options: CompleteDocumentOptions<SerializableTypeSync<"bson-doc", any, any>>): Promise<Document>;
function writeSync(format: any, val: any, options: any): any {
  const keysDiff: DiffKeysResult = diffKeys(options.properties, val);
  const result: Document = {};

  for (const key of keysDiff.commonKeys) {
    const member: any = val[key];
    const descriptor: PropertyDescriptor<any> = options.properties[key];
    if (member === null) {
      result[key] = null;
    } else {
      result[key] = descriptor.type.writeSync(format, member);
    }
  }

  return result;
}

function testErrorSync(val: Document, options: CompleteDocumentOptions<TypeSync<any>>): Error | null {
  if (typeof val !== "object") {
    return new Error("Unexpected type");
  }

  const keysDiff: DiffKeysResult = diffKeys(options.properties, val);

  const missingMandatoryKeys: string[] = _.filter(
    keysDiff.missingKeys,
    (key: string): boolean => {
      return !options.properties[key].optional;
    }
  );

  if (missingMandatoryKeys.length > 0) {
    return new MissingKeysError(missingMandatoryKeys);
  } else if (keysDiff.extraKeys.length > 0 && options.ignoreExtraKeys) {
    return new ExtraKeysError(keysDiff.extraKeys);
  }

  let errors: Dictionary<Error> | null = null;

  for (const key of keysDiff.commonKeys) {
    let curError: Error | null = null;
    const member: any = val[key];
    const descriptor: PropertyDescriptor<TypeSync<any>> = options.properties[key];

    if (member === null && !descriptor.nullable) {
      curError = new ForbiddenNullError(key);
    } else {
      curError = descriptor.type.testErrorSync(member);
    }

    if (curError !== null) {
      if (errors === null) {
        errors = {};
      }
      errors[key] = curError;
    }
  }

  if (errors !== null) {
    return new InvalidPropertiesError(errors);
  }

  return null;
}

function testSync(val: Document, options: CompleteDocumentOptions<TypeSync<any>>): boolean {
  return testErrorSync(val, options) === null;
}

function equalsSync(val1: Document, val2: Document, options: CompleteDocumentOptions<TypeSync<any>>): boolean {
  const keys: string[] = _.keys(options.properties);
  const val1Keys: string[] = _.intersection(keys, _.keys(val1));
  const val2Keys: string[] = _.intersection(keys, _.keys(val2));
  const commonKeys: string[] = _.intersection(val1Keys, val2Keys);
  const extraKeys: string[] = _.difference(val1Keys, val2Keys);
  const missingKeys: string[] = _.difference(val2Keys, val1Keys);

  if (extraKeys.length > 0 || missingKeys.length > 0) {
    return false;
  }

  for (const key of commonKeys) {
    if (val1[key] === null || val2[key] === null) {
      if (val1[key] !== val2[key]) {
        return false;
      }
    } else if (!options.properties[key].type.equalsSync(val1[key], val2[key])) {
      return false;
    }
  }

  return true;
}

function cloneSync(val: Document, options: CompleteDocumentOptions<TypeSync<any>>): Document {
  const keys: string[] = _.intersection(_.keys(options.properties), _.keys(val));

  const result: Document = {};

  for (const key of keys) {
    if (val[key] === null) {
      result[key] = null;
    } else {
      result[key] = options.properties[key].type.cloneSync(val[key]);
    }
  }

  return result;
}

function diffSync(oldVal: Document,
                  newVal: Document,
                  options: CompleteDocumentOptions<VersionedTypeSync<any, any, any>>): DocumentDiff | null {
  const keysDiff: DiffKeysResult = diffKeys(oldVal, newVal);  // TODO: intersection with properties
  const result: DocumentDiff = {set: {}, unset: {}, update: {}, toNull: {}, fromNull: {}};
  let equal: boolean = (keysDiff.extraKeys.length === 0 && keysDiff.missingKeys.length === 0);
  for (const key of keysDiff.extraKeys) {
    if (newVal[key] === null) {
      result.set[key] = null;
    } else {
      result.set[key] = options.properties[key].type.writeSync("json-doc", newVal[key]);
    }
  }
  for (const key of keysDiff.missingKeys) {
    if (oldVal[key] === null) {
      result.unset[key] = null;
    } else {
      result.unset[key] = options.properties[key].type.writeSync("json-doc", oldVal[key]);
    }
  }
  for (const key of keysDiff.commonKeys) {
    if (oldVal[key] === null || newVal[key] === null) {
      if (oldVal[key] === null && newVal[key] !== null) {
        result.fromNull = options.properties[key].type.writeSync("json-doc", newVal[key]);
        equal = false;
      } else if (oldVal[key] !== null && newVal[key] === null) {
        result.toNull = options.properties[key].type.writeSync("json-doc", oldVal[key]);
        equal = false;
      }
    } else {
      const diff: any = options.properties[key].type.diffSync(oldVal[key], newVal[key]);
      if (diff !== null) {
        result.update[key] = diff;
        equal = false;
      }
    }
  }
  return equal ? null : result;
}

function patchSync(oldVal: Document,
                   diff: DocumentDiff | null,
                   options: CompleteDocumentOptions<VersionedTypeSync<any, any, any>>): Document {
  const newVal: Document = cloneSync(oldVal, options);

  if (diff === null) {
    return newVal;
  }

  for (const key in diff.set) {
    if (diff.set[key] === null) {
      newVal[key] = null;
    } else {
      newVal[key] = options.properties[key].type.readSync("json-doc", diff.set[key]);
    }
  }
  for (const key in diff.fromNull) {
    newVal[key] = options.properties[key].type.readSync("json-doc", diff.fromNull[key]);
  }
  for (const key in diff.toNull) {
    newVal[key] = null;
  }
  for (const key in diff.update) {
    newVal[key] = options.properties[key].type.patchSync(newVal[key], diff.update[key]);
  }
  return newVal;
}

function reverseDiffSync(diff: DocumentDiff | null,
                         options: CompleteDocumentOptions<VersionedTypeSync<any, any, any>>): DocumentDiff | null {
  if (diff === null) {
    return null;
  }

  // TODO: clone the other values
  const reversed: DocumentDiff = {
    set: diff.unset,
    unset: diff.set,
    toNull: diff.fromNull,
    fromNull: diff.toNull,
    update: {}
  };
  for (const key in diff.update) {
    reversed.update[key] = options.properties[key].type.reverseDiffSync(diff.update[key]);
  }
  return reversed;
}
