import {NumericError} from "./errors/finite-number-error";
import {IncidentTypeError} from "./errors/unexpected-type-error";
import {
  SerializableTypeAsync,
  SerializableTypeSync,
  VersionedTypeAsync,
  VersionedTypeSync
} from "./interfaces";

export const NAME: string = "number";

export interface NumberOptions {}

function readSync(format: "json-doc" | "bson-doc", val: any, options?: NumberOptions): number {
  if (!(typeof val === "number")) {
    throw new IncidentTypeError("number", val);
  }
  if (!isFinite(val)) {
    throw new NumericError(val);
  }
  return val;
}

function readTrustedSync(format: "json-doc" | "bson-doc", val: any, options?: NumberOptions): number {
  return val;
}

function writeSync(format: "json-doc" | "bson-doc", val: number, options?: NumberOptions): number {
  return val;
}

function testErrorSync (val: any, options?: NumberOptions): Error | null {
  if (!(typeof val === "number")) {
    return new IncidentTypeError("number", val);
  }
  if (!isFinite(val)) {
    return new NumericError(val);
  }
  return null;
}

function testSync (val: any, options?: NumberOptions): boolean {
  return testErrorSync(val) === null;
}

function equalsSync (val1: number, val2: number, options?: NumberOptions): boolean {
  return val1 === val2;
}

function cloneSync (val: number, options?: NumberOptions): number {
  return val;
}

function diffSync (oldVal: number, newVal: number, options?: NumberOptions): [number, number] | null {
  // We can't use an arithmetic difference due to possible precision loss
  return oldVal === newVal ? null : [oldVal, newVal];
}

function patchSync (oldVal: number, diff: [number, number] | null, options?: NumberOptions): number {
  return diff === null ? oldVal : diff[1];
}

function reverseDiffSync (diff: [number, number] | null, options?: NumberOptions): [number, number] | null {
  return diff === null ? null : [diff[1], diff[0]];
}

export class NumberType implements
  SerializableTypeSync<number, "bson-doc", number>,
  VersionedTypeSync<number, number, [number, number]>,
  SerializableTypeAsync<number, "bson-doc", number>,
  VersionedTypeAsync<number, number, [number, number]> {

  isSync: true = true;
  isAsync: true = true;
  isSerializable: true = true;
  isVersioned: true = true;
  isCollection: false = false;
  type: string = NAME;
  types: string[] = [NAME];

  toJSON(): null {  // TODO: return options
    return null;
  }

  readTrustedSync (format: "json-doc" | "bson-doc", val: any, options?: NumberOptions): number {
    return readTrustedSync(format, val, options);
  }

  async readTrustedAsync (format: "json-doc" | "bson-doc", val: any, options?: NumberOptions): Promise<number> {
    return readTrustedSync(format, val, options);
  }

  readSync (format: "json-doc" | "bson-doc", val: any, options?: NumberOptions): number {
    return readSync(format, val, options);
  }

  async readAsync (format: "json-doc" | "bson-doc", val: any, options?: NumberOptions): Promise<number> {
    return readSync(format, val, options);
  }

  writeSync (format: "json-doc" | "bson-doc", val: number, options?: NumberOptions): any {
    return writeSync(format, val, options);
  }

  async writeAsync (format: "json-doc" | "bson-doc", val: number, options?: NumberOptions): Promise<any> {
    return writeSync(format, val, options);
  }

  testErrorSync (val: any, options?: NumberOptions): Error | null {
    return testErrorSync(val, options);
  }

  async testErrorAsync (val: any, options?: NumberOptions): Promise<Error | null> {
    return testErrorSync(val, options);
  }

  testSync (val: any, options?: NumberOptions): boolean {
    return testSync(val, options);
  }

  async testAsync (val: any, options?: NumberOptions): Promise<boolean> {
    return testSync(val, options);
  }

  equalsSync (val1: number, val2: number, options?: NumberOptions): boolean {
    return equalsSync(val1, val2, options);
  }

  async equalsAsync (val1: number, val2: number, options?: NumberOptions): Promise<boolean> {
    return equalsSync(val1, val2, options);
  }

  cloneSync (val: number, options?: NumberOptions): number {
    return cloneSync(val, options);
  }

  async cloneAsync (val: number, options?: NumberOptions): Promise<number> {
    return cloneSync(val, options);
  }

  diffSync (oldVal: number, newVal: number, options?: NumberOptions): [number, number] | null {
    return diffSync(oldVal, newVal, options);
  }

  async diffAsync (oldVal: number, newVal: number, options?: NumberOptions): Promise<[number, number] | null> {
    return diffSync(oldVal, newVal, options);
  }

  patchSync (oldVal: number, diff: [number, number] | null, options?: NumberOptions): number {
    return patchSync(oldVal, diff, options);
  }

  async patchAsync (oldVal: number, diff: [number, number] | null, options?: NumberOptions): Promise<number> {
    return patchSync(oldVal, diff, options);
  }

  reverseDiffSync(diff: [number, number] | null, options?: NumberOptions): [number, number] | null {
    return reverseDiffSync(diff, options);
  }

  async reverseDiffAsync(diff: [number, number] | null, options?: NumberOptions): Promise<[number, number] | null> {
    return reverseDiffSync(diff, options);
  }
}
