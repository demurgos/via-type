import {
  SerializableTypeAsync,
  SerializableTypeSync,
  VersionedTypeAsync,
  VersionedTypeSync
} from "./interfaces";
import {NumberType} from "./number";

const NAME: string = "integer";

export interface NumberOptions {}

function diffSync (oldVal: number, newVal: number): number | null {
  return oldVal === newVal ? null : newVal - oldVal;
}

function patchSync (oldVal: number, diff: number | null): number {
  return diff === null ? oldVal : oldVal + diff;
}

function reverseDiffSync (diff: number | null): number | null {
  return diff === null ? null : -diff;
}

export class IntegerType implements
  SerializableTypeSync<number, "bson-doc", number>,
  VersionedTypeSync<number, number, number>,
  SerializableTypeAsync<number, "bson-doc", number>,
  VersionedTypeAsync<number, number, number> {

  isSync: true = true;
  isAsync: true = true;
  isSerializable: true = true;
  isVersioned: true = true;
  isCollection: false = false;
  type: string = NAME;
  types: string[] = [NAME];

  numberType: NumberType;

  constructor () {
    this.numberType = new NumberType();
  }

  toJSON(): null {  // TODO: return options
    return null;
  }

  readTrustedSync (format: "json-doc" | "bson-doc", val: number): number {
    return val;
  }

  async readTrustedAsync (format: "json-doc" | "bson-doc", val: number): Promise<number> {
      return val;
  }

  readSync (format: "json-doc" | "bson-doc", val: number): number {
    const numVal: number = this.numberType.readSync(format, val);
    if (Math.floor(numVal) !== numVal) {
      throw new Error("Not an integer");
    }
    return numVal;
  }

  async readAsync (format: "json-doc" | "bson-doc", val: number): Promise<number> {
    return this.readSync(format, val);
  }

  writeSync (format: "json-doc" | "bson-doc", val: number): number {
    return val;
  }

  async writeAsync (format: "json-doc" | "bson-doc", val: number): Promise<number> {
    return val;
  }

  testErrorSync (val: any): Error | null {
    const err: Error | null = this.numberType.testErrorSync(val);
    if (err !== null) {
      return err;
    }
    if (Math.floor(val) !== val) {
      return new Error("Not an integer");
    }
    return null;
  }

  async testErrorAsync (val: any): Promise<Error | null> {
    return this.testErrorSync(val);
  }

  testSync (val: any): boolean {
    return this.testErrorSync(val) === null;
  }

  async testAsync (val: any): Promise<boolean> {
    return (await this.testErrorAsync(val)) === null;
  }

  equalsSync (val1: number, val2: number): boolean {
    return val1 === val2;
  }

  async equalsAsync (val1: number, val2: number): Promise<boolean> {
    return val1 === val2;
  }

  cloneSync (val: number): number {
    return val;
  }

  async cloneAsync (val: number): Promise<number> {
    return val;
  }

  diffSync (oldVal: number, newVal: number): number | null {
    return diffSync(oldVal, newVal);
  }

  async diffAsync (oldVal: number, newVal: number): Promise<number | null> {
    return diffSync(oldVal, newVal);
  }

  patchSync (oldVal: number, diff: number | null): number {
    return patchSync(oldVal, diff);
  }

  async patchAsync (oldVal: number, diff: number | null): Promise<number> {
    return patchSync(oldVal, diff);
  }

  reverseDiffSync(diff: number | null): number | null {
    return reverseDiffSync(diff);
  }

  async reverseDiffAsync(diff: number | null): Promise<number | null> {
    return reverseDiffSync(diff);
  }
}
