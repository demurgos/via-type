import {IncidentTypeError} from "./errors/unexpected-type-error";
import {
  SerializableTypeAsync,
  SerializableTypeSync,
  VersionedTypeAsync,
  VersionedTypeSync
} from "./interfaces";

export const NAME: string = "boolean";

export interface BooleanOptions {}

function readSync(format: "json-doc" | "bson-doc", val: any): boolean {
  return Boolean(val);
}

function readTrustedSync(format: "json-doc" | "bson-doc", val: boolean): boolean {
  return val;
}

function writeSync(format: "json-doc" | "bson-doc", val: boolean): boolean {
  return val;
}

function testErrorSync (val: boolean): Error | null {
  if (typeof val !== "boolean") {
    return new IncidentTypeError("boolean", val);
  }
  return null;
}

function testSync (val: boolean): boolean {
  return testErrorSync(val) === null;
}

function equalsSync (val1: boolean, val2: boolean): boolean {
  return val1 === val2;
}

function cloneSync (val: boolean): boolean {
  return val;
}

/**
 * Creates a diff between two boolean values.
 *
 * @param oldVal
 * @param newVal
 * @param options
 * @returns {boolean|null} `true` if there is a difference, `null` otherwise
 */
function diffSync (oldVal: boolean, newVal: boolean): boolean | null {
  return (oldVal !== newVal) && null;
}

function patchSync (oldVal: boolean, diff: boolean | null): boolean {
  return oldVal === (diff === null);
}

function reverseDiffSync (diff: boolean | null): boolean | null {
  return diff;
}

function squashSync (diff1: boolean | null, diff2: boolean | null): boolean | null {
  return (diff1 !== diff2) && null;
}

export class BooleanType implements
  SerializableTypeSync<boolean, "bson-doc", boolean>,
  VersionedTypeSync<boolean, boolean, boolean>,
  SerializableTypeAsync<boolean, "bson-doc", boolean>,
  VersionedTypeAsync<boolean, boolean, boolean>  {

  isSync: true = true;
  isAsync: true = true;
  isSerializable: true = true;
  isVersioned: true = true;
  isCollection: false = false;
  type: string = NAME;
  types: string[] = [NAME];

  toJSON(): null { // TODO: return options
    return null;
  }

  readTrustedSync (format: "json-doc" | "bson-doc", val: boolean): boolean {
    return readTrustedSync(format, val);
  }

  async readTrustedAsync (format: "json-doc" | "bson-doc", val: boolean): Promise<boolean> {
    return readTrustedSync(format, val);
  }

  readSync (format: "json-doc" | "bson-doc", val: any): boolean {
    return readSync(format, val);
  }

  async readAsync (format: "json-doc" | "bson-doc", val: any): Promise<boolean> {
    return readSync(format, val);
  }

  writeSync (format: "json-doc" | "bson-doc", val: boolean): any {
    return writeSync(format, val);
  }

  async writeAsync (format: "json-doc" | "bson-doc", val: boolean): Promise<any> {
    return writeSync(format, val);
  }

  testErrorSync (val: boolean): Error | null {
    return testErrorSync(val);
  }

  async testErrorAsync (val: boolean): Promise<Error | null> {
    return testErrorSync(val);
  }

  testSync (val: boolean): boolean {
    return testSync(val);
  }

  async testAsync (val: boolean): Promise<boolean> {
    return testSync(val);
  }

  equalsSync (val1: boolean, val2: boolean): boolean {
    return equalsSync(val1, val2);
  }

  async equalsAsync (val1: boolean, val2: boolean): Promise<boolean> {
    return equalsSync(val1, val2);
  }

  cloneSync (val: boolean): boolean {
    return cloneSync(val);
  }

  async cloneAsync (val: boolean): Promise<boolean> {
    return cloneSync(val);
  }

  diffSync (oldVal: boolean, newVal: boolean): boolean | null {
    return diffSync(oldVal, newVal);
  }

  async diffAsync (oldVal: boolean, newVal: boolean): Promise<boolean | null> {
    return diffSync(oldVal, newVal);
  }

  patchSync (oldVal: boolean, diff: boolean | null): boolean {
    return patchSync(oldVal, diff);
  }

  async patchAsync (oldVal: boolean, diff: boolean | null): Promise<boolean> {
    return patchSync(oldVal, diff);
  }

  reverseDiffSync(diff: boolean | null): boolean | null {
    return reverseDiffSync(diff);
  }

  async reverseDiffAsync(diff: boolean | null): Promise<boolean | null> {
    return reverseDiffSync(diff);
  }

  squashSync(diff1: boolean | null, diff2: boolean | null): boolean | null {
    return squashSync(diff1, diff2);
  }

  async squashAsync(diff1: boolean | null, diff2: boolean | null): Promise<boolean | null> {
    return squashSync(diff1, diff2);
  }
}
