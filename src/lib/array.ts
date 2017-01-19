import * as Bluebird from "bluebird";
import * as _ from "lodash";
import {InvalidItemsError} from "./errors/invalid-items-error";
import {MaxLengthError} from "./errors/max-length-error";
import {NotImplementedError} from "./errors/not-implemented-error";
import {IncidentTypeError} from "./errors/unexpected-type-error";
import {
  NumericDictionary,
  SerializableTypeAsync,
  SerializableTypeSync,
  TypeAsync,
  TypeBase,
  TypeSync,
  VersionedTypeAsync,
  VersionedTypeSync
} from "./interfaces";

const NAME: string = "array";

export interface ArrayOptions<TypeKind> {
  maxLength: number | null;
  itemType: TypeKind | null;
}

export interface ArrayDiff {
  append?: any[];
  pop?: any[];
  prepend?: any[];
  shift?: any[];
}

const defaultOptions: ArrayOptions<TypeBase> = {
  maxLength: null,
  itemType: null
};

// Serializable
function writeSync<I, S>(format: "json-doc",
                         val: I[],
                         options: ArrayOptions<SerializableTypeSync<I, "json-doc", S>>): S[];
function writeSync<I, S>(format: "bson-doc",
                         val: I[],
                         options: ArrayOptions<SerializableTypeSync<I, "bson-doc", S>>): S[];
function writeSync<I, S>(format: any, val: any, options: any): any {
  return _.map(
    val,
    (item: I): S => {
      return options.itemType.writeSync(format, item);
    }
  );
}

async function writeAsync<I, S>(format: "json-doc",
                                val: I[],
                                options: ArrayOptions<SerializableTypeSync<I, "json-doc", S>>): Promise<S[]>;
async function writeAsync<I, S>(format: "bson-doc",
                                val: I[],
                                options: ArrayOptions<SerializableTypeSync<I, "bson-doc", S>>): Promise<S[]>;
async function writeAsync<I, S>(format: any, val: any, options: any): Promise<any> {
  return Promise.all(
    _.map(
      val,
      async function (item: I): Promise<S> {
        return options.itemType.writeAsync(format, item);
      }
    )
  );
}

function readTrustedSync<I, S>(format: "json-doc",
                               val: S[],
                               options: ArrayOptions<SerializableTypeSync<I, "json-doc", S>>): I[];
function readTrustedSync<I, S>(format: "bson-doc",
                               val: S[],
                               options: ArrayOptions<SerializableTypeSync<I, "bson-doc", S>>): I[];
function readTrustedSync<I, S>(format: any, val: any, options: any): any {
  return _.map(
    val,
    (item: S): I => {
      return options.itemType.readTrustedSync(format, item);
    }
  );
}

async function readTrustedAsync<I, S>(format: "json-doc",
                                      val: S[],
                                      options: ArrayOptions<SerializableTypeSync<I, "json-doc", S>>): Promise<I[]>;
async function readTrustedAsync<I, S>(format: "bson-doc",
                                      val: S[],
                                      options: ArrayOptions<SerializableTypeSync<I, "bson-doc", S>>): Promise<I[]>;
async function readTrustedAsync<I, S>(format: any, val: any, options: any): Promise<any> {
  return Promise.all(
    _.map(
      val,
      async function (item: S): Promise<I> {
        return options.itemType.readTrustedAsync(format, item);
      }
    )
  );
}

function readSync<I, S>(format: "json-doc",
                        val: S[],
                        options: ArrayOptions<SerializableTypeSync<I, "json-doc", S>>): I[];
function readSync<I, S>(format: "bson-doc",
                        val: S[],
                        options: ArrayOptions<SerializableTypeSync<I, "bson-doc", S>>): I[];
function readSync<I, S>(format: any, val: any, options: any): any {
  if (!Array.isArray(val)) {
    throw new IncidentTypeError("array", val);
  }
  return _.map(
    val,
    (item: S): I => {
      return options.itemType.readSync(format, item);
    }
  );
}

async function readAsync<I, S>(format: "json-doc",
                               val: S[],
                               options: ArrayOptions<SerializableTypeSync<I, "json-doc", S>>): Promise<I[]>;
async function readAsync<I, S>(format: "bson-doc",
                               val: S[],
                               options: ArrayOptions<SerializableTypeSync<I, "bson-doc", S>>): Promise<I[]>;
async function readAsync<I, S>(format: any, val: any, options: any): Promise<any> {
  if (!Array.isArray(val)) {
    throw new IncidentTypeError("array", val);
  }
  return Promise.all(
    _.map(
      val,
      async function (item: S): Promise<I> {
        return options.itemType.readAsync(format, item);
      }
    )
  );
}

export class ArrayType<I> implements SerializableTypeSync<I[], "bson-doc", any[]>,
  VersionedTypeSync<I[], any[], ArrayDiff>,
  SerializableTypeAsync<I[], "bson-doc", any[]>,
  VersionedTypeAsync<I[], any[], ArrayDiff> {

  isSync: true = true;
  isAsync: true = true;
  isSerializable: true = true;
  isVersioned: true = true;
  isCollection: true = true;
  type: string = NAME;
  types: string[] = [NAME];

  options: ArrayOptions<TypeBase>;

  constructor(options: ArrayOptions<TypeBase>) {
    this.options = _.merge({}, defaultOptions, options);
    this.isSync = options.itemType === null || <any> options.itemType.isSync;
    this.isAsync = options.itemType === null || <any> options.itemType.isAsync;
  }

  toJSON(): null { // TODO: return options
    return null;
  }

  writeSync<S>(format: "json-doc", val: I[]): S[];
  writeSync<S>(format: "bson-doc", val: I[]): S[];
  writeSync<S>(format: any, val: any): any {
    if (!this.isSync) {
      throw new Error("Cannot call sync method on array of async item type");
    }
    return writeSync(format, val, <any> this.options);
  }

  async writeAsync<S>(format: "json-doc", val: I[]): Promise<S[]>;
  async writeAsync<S>(format: "bson-doc", val: I[]): Promise<S[]>;
  async writeAsync<S>(format: any, val: any): Promise<any> {
    if (!this.isAsync) {
      throw new Error("Cannot call async method on array of sync item type");
    }
    return writeAsync(format, val, <any> this.options);
  }

  readTrustedSync<S>(format: "json-doc", val: S[]): I[];
  readTrustedSync<S>(format: "bson-doc", val: S[]): I[];
  readTrustedSync<S>(format: any, val: any): any {
    if (!this.isSync) {
      throw new Error("Cannot call sync method on array of async item type");
    }
    return readTrustedSync(format, val, <any> this.options);
  }

  async readTrustedAsync<S>(format: "json-doc", val: S[]): Promise<I[]>;
  async readTrustedAsync<S>(format: "bson-doc", val: S[]): Promise<I[]>;
  async readTrustedAsync<S>(format: any, val: any): Promise<any> {
    if (!this.isAsync) {
      throw new Error("Cannot call async method on array of sync item type");
    }
    return readTrustedAsync(format, val, <any> this.options);
  }

  readSync(format: "json-doc", val: any[]): I[];
  readSync(format: "bson-doc", val: any[]): I[];
  readSync(format: any, val: any): any {
    if (!this.isSync) {
      throw new Error("Cannot call sync method on array of async item type");
    }
    return readSync(format, val, <any> this.options);
  }

  async readAsync(format: "json-doc", val: any[]): Promise<I[]>;
  async readAsync(format: "bson-doc", val: any[]): Promise<I[]>;
  async readAsync(format: any, val: any): Promise<any> {
    if (!this.isAsync) {
      throw new Error("Cannot call async method on array of sync item type");
    }
    return readAsync(format, val, <any> this.options);
  }

  testErrorSync(val: I[]): Error | null {
    if (!this.isSync) {
      throw new Error("Cannot call sync method on array of async item type");
    }
    const itemType: TypeSync<any> = <any> this.options.itemType;
    if (!_.isArray(val)) {
      return new IncidentTypeError("array", val);
    }
    if (this.options.maxLength !== null && val.length > this.options.maxLength) {
      return new MaxLengthError(val, this.options.maxLength);
    }

    const mapped: (Error | null)[] = _.map(
      val,
      (item: I): Error | null => {
        return itemType.testErrorSync(item);
      }
    );
    const errors: NumericDictionary<Error> | null = _.reduce(
      mapped,
      (memo: NumericDictionary<Error> | null, current: Error | null, idx: number): NumericDictionary<Error> | null => {
        if (current === null) {
          return memo;
        }
        if (memo === null) {
          memo = {};
        }
        memo[idx] = current;
        return memo;
      },
      null
    );
    if (errors !== null) {
      return new InvalidItemsError(errors); // TODO
    }
    return null;
  }

  async testErrorAsync(val: I[]): Promise<Error | null> {
    if (!this.isAsync) {
      throw new Error("Cannot call async method on array of sync item type");
    }
    const itemType: TypeAsync<any> = <any> this.options.itemType;

    if (!Array.isArray(val)) {
      return new IncidentTypeError("array", val);
    }

    if (this.options.maxLength !== null && val.length > this.options.maxLength) {
      return new MaxLengthError(val, this.options.maxLength);
    }

    if (this.options.itemType === null) { // manually managed type
      return null;
    }

    return Bluebird.resolve(val)
      .map((item: I): Promise<Error | null> => {
        return itemType.testErrorAsync(item);
      })
      .reduce(
        // tslint:disable:max-line-length
        (memo: NumericDictionary<Error> | null, current: Error | null, idx: number): NumericDictionary<Error> | null => {
          if (current === null) {
            return memo;
          }
          if (memo === null) {
            memo = {};
          }
          memo[idx] = current;
          return memo;
        },
        null
      )
      .then((errors) => {
        if (errors !== null) {
          return new InvalidItemsError(errors); // TODO
        }
        return null;
      });
  }

  testSync(val: I[]): boolean {
    return this.testErrorSync(val) === null;
  }

  async testAsync(val: I[]): Promise<boolean> {
    return (await this.testErrorAsync(val)) === null;
  }

  equalsSync(val1: I[], val2: I[]): boolean {
    if (!this.isSync) {
      throw new Error("Cannot call sync method on array of async item type");
    }
    if (val1.length !== val2.length) {
      return false;
    }
    if (this.options.itemType === null) {
      // console.warn("Untyped item");
      return true;
    }

    const itemType: TypeSync<any> = <TypeSync<any>> this.options.itemType;
    const mapped: boolean[] = _.map(
      val1,
      (item: I, idx: number): boolean => {
        return itemType.equalsSync(item, val2[idx]);
      }
    );
    return _.reduce(
      mapped,
      (memo: boolean, current: boolean): boolean => {
        return memo && current;
      },
      true
    );
  }

  async equalsAsync(val1: I[], val2: I[]): Promise<boolean> {
    if (!this.isAsync) {
      throw new Error("Cannot call async method on array of sync item type");
    }
    const itemType: TypeAsync<any> = <any> this.options.itemType;
    return Bluebird.try(() => {
      if (val1.length !== val2.length) {
        return false;
      }
      return Bluebird.resolve(val1)
        .map((item, idx) => {
          return itemType.equalsAsync(item, val2[idx]);
        })
        .reduce((memo: boolean, current: boolean) => memo && current, true);
    });
  }

  cloneSync(val: I[]): I[] {
    if (!this.isSync) {
      throw new Error("Cannot call sync method on array of async item type");
    }
    const itemType: TypeSync<any> = <any> this.options.itemType;
    return _.map(
      val,
      (item: I): I => {
        return itemType.cloneSync(val);
      }
    );
  }

  async cloneAsync(val: I[]): Promise<I[]> {
    if (!this.isAsync) {
      throw new Error("Cannot call async method on array of sync item type");
    }
    const itemType: TypeAsync<any> = <any> this.options.itemType;
    return Bluebird.map(
      val,
      (item: I): Promise<I> => {
        return itemType.cloneAsync(item);
      }
    );
  }

  diffSync(oldVal: I[], newVal: I[]): ArrayDiff | null {
    if (!this.isSync) {
      throw new Error("Cannot call sync method on array of async item type");
    }
    throw new Error("Not implemented");
  }

  async diffAsync(oldVal: I[], newVal: I[]): Promise<ArrayDiff | null> {
    if (!this.isAsync) {
      throw new Error("Cannot call async method on array of sync item type");
    }
    return Bluebird.reject(new Error("Not implemented"));
  }

  patchSync(oldVal: I[], diff: ArrayDiff | null): I[] {
    if (!this.isSync) {
      throw new Error("Cannot call sync method on array of async item type");
    }
    throw new Error("Not implemented");
  }

  async patchAsync(oldVal: I[], diff: ArrayDiff | null): Promise<I[]> {
    if (!this.isAsync) {
      throw new Error("Cannot call async method on array of sync item type");
    }
    return Bluebird.reject(new Error("Not implemented"));
  }

  reverseDiffSync(diff: ArrayDiff | null): ArrayDiff | null {
    if (!this.isSync) {
      throw new Error("Cannot call sync method on array of async item type");
    }
    throw new Error("Not implemented");
  }

  async reverseDiffAsync(diff: ArrayDiff | null): Promise<ArrayDiff | null> {
    if (!this.isAsync) {
      throw new Error("Cannot call async method on array of sync item type");
    }
    return Bluebird.reject(new Error("Not implemented"));
  }

  //noinspection TypeScriptUnresolvedVariable
  iterateSync(value: any[]): IteratorResult<I> {
    throw new NotImplementedError("Array:iterateAsync");
  }

  //noinspection TypeScriptUnresolvedVariable
  async iterateAsync(value: any[]): Promise<IteratorResult<PromiseLike<I>>> {
    throw new NotImplementedError("Array:iterateAsync");
  }
}
