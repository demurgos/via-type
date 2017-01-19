import * as _ from "lodash";
import {InvalidTimestampError} from "./errors/invalid-timestamp-error";
import {KryoError} from "./errors/kryo-error";
import {UnsupportedFormatError} from "./errors/unsupported-format-error";
import {
  SerializableTypeAsync,
  SerializableTypeSync,
  VersionedTypeAsync,
  VersionedTypeSync
} from "./interfaces";

export const NAME: string = "date";

export interface DateOptions {}

export const defaultOptions: DateOptions = {

};

function readSync(format: "json-doc" | "bson-doc", val: any, options?: DateOptions): Date {
  switch (format) {
    case "json-doc":
      if (_.isString(val)) {
        val = Date.parse(val);
      }
      if (!_.isFinite(val)) {
        throw new KryoError<{}>("Unable to read JSON date");
      }
      val = new Date(val);
      break;
    case "bson-doc":
      break;
    default:
      throw new UnsupportedFormatError(format);
  }
  const err: Error | null = testErrorSync(val);
  if (err !== null) {
    throw err;
  }
  return val;
}

function readTrustedSync(format: "json-doc" | "bson-doc", val: string | Date, options?: DateOptions): Date {
  switch (format) {
    case "json-doc":
      return new Date(<string> val);
    case "bson-doc":
      return new Date((<Date> val).getTime());
    default:
      throw new UnsupportedFormatError(format);
  }
}

function writeSync (format: "json-doc", val: Date, options?: DateOptions): string;
function writeSync (format: "bson-doc", val: Date, options?: DateOptions): Date;
function writeSync (format: any, val: any, options: any): any {
  return format === "json-doc" ? val.toJSON() : val;
}

function testErrorSync (val: Date, options?: DateOptions): Error | null {
  if (!(val instanceof Date)) {
    return new KryoError<{value: any}>("DateTypeError", {value: val}, "Expected value to be instanceof Date");
  }
  if (isNaN(val.getTime())) {
    return new InvalidTimestampError(val);
  }

  return null;
}

function testSync (val: Date, options?: DateOptions): boolean {
  return testErrorSync(val) === null;
}

function equalsSync (val1: Date, val2: Date, options?: DateOptions): boolean {
  return val1.getTime() === val2.getTime();
}

function cloneSync (val: Date, options?: DateOptions): Date {
  return new Date(val.getTime());
}

function diffSync (oldVal: Date, newVal: Date, options?: DateOptions): number | null {
  return newVal.getTime() - oldVal.getTime();
}

function patchSync (oldVal: Date, diff: number | null, options?: DateOptions): Date {
  return new Date(oldVal.getTime() + diff);
}

function reverseDiffSync (diff: number | null, options?: DateOptions): number | null {
  return diff === null ? null : -diff;
}

function squashSync (diff1: number | null, diff2: number | null, options?: DateOptions): number | null {
  if (diff1 === null) {
    return diff2 === null ? null : diff2;
  } else {
    return diff2 === null ? diff1 : diff1 + diff2;
  }
}

export class DateType implements
  SerializableTypeSync<Date, "bson-doc", Date>,
  VersionedTypeSync<Date, string, number>,
  SerializableTypeAsync<Date, "bson-doc", Date>,
  VersionedTypeAsync<Date, string, number> {

  isSync: true = true;
  isAsync: true = true;
  isSerializable: true = true;
  isVersioned: true = true;
  isCollection: false = false;
  type: string = NAME;
  types: string[] = [NAME];

  options: DateOptions;

  constructor(options?: DateOptions) {
    this.options = _.merge({}, defaultOptions, options);
  }

  toJSON(): null { // TODO: return options
    return null;
  }

  readTrustedSync (format: "json-doc", val: string): Date;
  readTrustedSync (format: "bson-doc", val: Date): Date;
  readTrustedSync (format: any, val: any): any {
    return readTrustedSync(format, val, this.options);
  }

  async readTrustedAsync (format: "json-doc", val: string): Promise<Date>;
  async readTrustedAsync (format: "bson-doc", val: Date): Promise<Date>;
  async readTrustedAsync (format: any, val: any): Promise<any> {
    return readTrustedSync(format, val, this.options);
  }

  readSync (format: "json-doc", val: string): Date;
  readSync (format: "bson-doc", val: Date): Date;
  readSync (format: any, val: any): any {
    return readSync(format, val, this.options);
  }

  async readAsync (format: "json-doc", val: string | number): Promise<Date>;
  async readAsync (format: "bson-doc", val: Date): Promise<Date>;
  async readAsync (format: any, val: any): Promise<any> {
    return readSync(format, val, this.options);
  }

  writeSync (format: "json-doc", val: Date): string;
  writeSync (format: "bson-doc", val: Date): Date;
  writeSync (format: any, val: any): any {
    return writeSync(format, val, this.options);
  }

  async writeAsync (format: "json-doc", val: Date): Promise<string>;
  async writeAsync (format: "bson-doc", val: Date): Promise<Date>;
  async writeAsync (format: any, val: any): Promise<any> {
    return writeSync(format, val, this.options);
  }

  testErrorSync (val: Date, options?: DateOptions): Error | null {
    return testErrorSync(val, options);
  }

  async testErrorAsync (val: Date, options?: DateOptions): Promise<Error | null> {
    return testErrorSync(val, options);
  }

  testSync (val: Date, options?: DateOptions): boolean {
    return testSync(val, options);
  }

  async testAsync (val: Date, options?: DateOptions): Promise<boolean> {
    return testSync(val, options);
  }

  equalsSync (val1: Date, val2: Date, options?: DateOptions): boolean {
    return equalsSync(val1, val2, options);
  }

  async equalsAsync (val1: Date, val2: Date, options?: DateOptions): Promise<boolean> {
    return equalsSync(val1, val2, options);
  }

  cloneSync (val: Date, options?: DateOptions): Date {
    return cloneSync(val, options);
  }

  async cloneAsync (val: Date, options?: DateOptions): Promise<Date> {
    return cloneSync(val, options);
  }

  diffSync (oldVal: Date, newVal: Date, options?: DateOptions): number | null {
    return diffSync(oldVal, newVal, options);
  }

  async diffAsync (oldVal: Date, newVal: Date, options?: DateOptions): Promise<number | null> {
    return diffSync(oldVal, newVal, options);
  }

  patchSync (oldVal: Date, diff: number | null, options?: DateOptions): Date {
    return patchSync(oldVal, diff, options);
  }

  async patchAsync (oldVal: Date, diff: number | null, options?: DateOptions): Promise<Date> {
    return patchSync(oldVal, diff, options);
  }

  reverseDiffSync(diff: number | null, options?: DateOptions): number | null {
    return reverseDiffSync(diff, options);
  }

  async reverseDiffAsync(diff: number | null, options?: DateOptions): Promise<number | null> {
    return reverseDiffSync(diff, options);
  }

  squashSync(diff1: number | null, diff2: number | null, options?: DateOptions): number | null {
    return squashSync(diff1, diff2, options);
  }

  async squashAsync(diff1: number | null, diff2: number | null, options?: DateOptions): Promise<number | null> {
    return squashSync(diff1, diff2, options);
  }
}
