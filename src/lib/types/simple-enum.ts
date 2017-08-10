import {Incident} from "incident";
import {NotImplementedError} from "../errors/not-implemented";
import {WrongTypeError} from "../errors/wrong-type";
import {CaseStyle, rename} from "../helpers/rename";
import {SerializableType, VersionedType} from "../interfaces";

export type SimpleEnum<EnumConstructor> = {
  [K in keyof EnumConstructor]: EnumConstructor[K];
};

interface ReversedEnum<EC> {
  [index: number]: (keyof EC) | undefined;
}

type DoubleEnum<EC> = SimpleEnum<EC> & ReversedEnum<EC>;

interface AnySimpleEnum {
  [name: string]: number;
}

interface AnyReversedEnum {
  [value: number]: string;
}

type AnyDoubleEnum = AnySimpleEnum & AnyReversedEnum;

// This is strictly an alias for `number` for the moment since Typescript
// does not use union types for enum values (as of TS 2.3)
export interface EnumConstructor<EnumValue extends number> {
  [name: string]: EnumValue;
}

export type Name = "simple-enum";
export const name: Name = "simple-enum";
export namespace bson {
  export type Input = string;
  export type Output = string;
}
export namespace json {
  export type Input = string;
  export type Output = string;
  export interface Type {
    name: Name;
    enum: EnumConstructor<number>;
  }
}
export namespace qs {
  export type Input = string;
  export type Output = string;
}
export type Diff = number;

export interface Options<E extends number> {
  enum: EnumConstructor<E> | Object;
  rename?: CaseStyle;
}

/**
 * Supports enums from keys that are valid Javascript identifiers to unique integer values
 */
export class SimpleEnumType<E extends number>
  implements VersionedType<E, json.Input, json.Output, Diff>,
    SerializableType<E, "bson", bson.Input, bson.Output>,
    SerializableType<E, "qs", qs.Input, qs.Output> {
  readonly name: Name = name;
  readonly enum: EnumConstructor<E>;
  private readonly rename?: CaseStyle;
  private readonly outputNameToValue: AnySimpleEnum;
  private readonly valueToOutputName: AnyReversedEnum;

  constructor(options: Options<E>) {
    this.enum = <any> options.enum;
    this.rename = options.rename;

    this.outputNameToValue = {};
    this.valueToOutputName = {};
    for (const key in options.enum) {
      if (/^\d+$/.test(key)) {
        continue;
      }
      const value: number = (<{[name: string]: number}> options.enum)[key];
      if (typeof value !== "number") {
        throw WrongTypeError.create("number", value);
      }
      if (!options.enum.hasOwnProperty(value) || !options.enum.hasOwnProperty(value)) {
        throw new Incident("NotSimpleEnum", "Not owned key or value");
      }
      if ((<{[value: number]: string}> options.enum)[value] !== key) {
        throw new Incident("NotReversibleEnum", "enum[enum[key]] !== key");
      }
      let renamed: string;
      if (options.rename === undefined) {
        renamed = key;
      } else {
        renamed = rename(key, options.rename);
      }
      this.outputNameToValue[renamed] = value;
      this.valueToOutputName[value] = renamed;
    }
  }

  static fromJSON(): SimpleEnumType<any> {
    throw NotImplementedError.create("SimpleEnumType.fromJSON");
  }

  toJSON(): json.Type {
    throw NotImplementedError.create("SimpleEnumType#toJSON");
  }

  readTrusted(format: "bson", val: bson.Output): E;
  readTrusted(format: "json", val: json.Output): E;
  readTrusted(format: "qs", val: qs.Output): E;
  readTrusted(format: "bson" | "json" | "qs", input: any): E {
    return this.outputNameToValue[input] as E;
  }

  read(format: "bson" | "json" | "qs", input: any): E {
    if (typeof input !== "string") {
      throw WrongTypeError.create("string", input);
    }
    if (!this.outputNameToValue.hasOwnProperty(input)) {
      throw Incident("Unknown enum variant name", input);
    }
    return this.outputNameToValue[input] as E;
  }

  write(format: "bson", val: E): bson.Output;
  write(format: "json", val: E): json.Output;
  write(format: "qs", val: E): qs.Output;
  write(format: "bson" | "json" | "qs", val: E): any {
    return this.valueToOutputName[val as number];
  }

  testError(val: E): Error | undefined {
    if (typeof val !== "number") {
      return WrongTypeError.create("number", val);
    }
    // TODO(demurgos): Remove <number> once typedoc supports it
    if (isNaN(val) || val === Infinity || val === -Infinity || (<number> val | 0) !== val) {
      return WrongTypeError.create("int32", val);
    }
    if (!this.enum.hasOwnProperty(val)) {
      return Incident("Unknown enum variant value", val);
    }
    return undefined;
  }

  test(val: E): val is E {
    return typeof val === "number" && this.enum.hasOwnProperty(val);
  }

  equals(val1: E, val2: E): boolean {
    return val1 === val2;
  }

  clone(val: E): E {
    return val;
  }

  diff(oldVal: E, newVal: E): Diff | undefined {
    return newVal === oldVal ? undefined : <number> newVal - <number> oldVal;
  }

  patch(oldVal: E, diff: Diff | undefined): E {
    return diff === undefined ? oldVal : <number> oldVal + diff as E;
  }

  reverseDiff(diff: Diff | undefined): Diff | undefined {
    /* tslint:disable-next-line:strict-boolean-expressions */
    return diff && -diff;
  }

  squash(diff1: Diff | undefined, diff2: Diff | undefined): Diff | undefined {
    if (diff1 === undefined) {
      return diff2;
    } else if (diff2 === undefined) {
      return diff1;
    }
    return diff2 === -diff1 ? undefined : diff1 + diff2;
  }
}

export {SimpleEnumType as Type};
