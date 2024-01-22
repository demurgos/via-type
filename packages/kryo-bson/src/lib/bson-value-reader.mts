/**
 * @module kryo/readers/bson-value
 */

import {Binary} from "bson";
import {CheckId, KryoContext, Reader, ReadVisitor, Result, writeError} from "kryo";
import {BaseTypeCheck} from "kryo/checks/base-type";
import {CheckKind} from "kryo/checks/check-kind";
import {InstanceOfCheck} from "kryo/checks/instance-of";
import {PropertyKeyCheck} from "kryo/checks/property-key";
import {JsonReader} from "kryo-json/json-reader";

function isBinary(val: unknown): val is Binary {
  return val !== null && typeof val === "object" && Reflect.get(val, "_bsontype") === "Binary";
}

export class BsonValueReader implements Reader<unknown> {
  trustInput?: boolean | undefined;

  constructor(trust?: boolean) {
    this.trustInput = trust;
  }

  readAny<T>(cx: KryoContext, input: unknown, visitor: ReadVisitor<T>): Result<T, CheckId> {
    switch (typeof input) {
      case "boolean":
        return visitor.fromBoolean(input);
      case "string":
        return visitor.fromString(input);
      case "object":
        return input === null
          ? visitor.fromNull()
          : visitor.fromMap(new Map(Object.keys(input).map(k => [k, Reflect.get(input, k)] as [string, unknown])), this, this);
      default:
        return writeError(cx, {
          check: CheckKind.BaseType,
          expected: ["Array", "Boolean", "Bytes", "Null", "Object", "UsvString", "Ucs2String"]
        } satisfies BaseTypeCheck);
    }
  }

  readBoolean<T>(cx: KryoContext, input: unknown, visitor: ReadVisitor<T>): Result<T, CheckId> {
    if (typeof input !== "boolean") {
      return writeError(cx, {check: CheckKind.BaseType, expected: ["Boolean"]} satisfies BaseTypeCheck);
    }
    return visitor.fromBoolean(input);
  }

  readBytes<T>(cx: KryoContext, input: unknown, visitor: ReadVisitor<T>): Result<T, CheckId> {
    if (!isBinary(input)) {
      return writeError(cx, {check: CheckKind.BaseType, expected: ["Bytes"]} satisfies BaseTypeCheck);
    }
    // TODO: Fix BSON type definitions
    const inputBytes: Uint8Array = input.value(true) as Buffer;
    return visitor.fromBytes(inputBytes);
  }

  readDate<T>(cx: KryoContext, input: unknown, visitor: ReadVisitor<T>): Result<T, CheckId> {
    if (!(input instanceof Date)) {
      return writeError(cx, {check: CheckKind.InstanceOf, class: "Date"} satisfies InstanceOfCheck);
    }
    return visitor.fromDate(new Date(input.getTime()));
  }

  readRecord<T>(cx: KryoContext, input: unknown, visitor: ReadVisitor<T>): Result<T, CheckId> {
    if (typeof input !== "object" || input === null) {
      return writeError(cx, {check: CheckKind.BaseType, expected: ["Record"]} satisfies BaseTypeCheck);
    }
    const inputMap: Map<string, unknown> = new Map();
    for (const key in input) {
      inputMap.set(key, Reflect.get(input, key));
    }
    return visitor.fromMap(inputMap, this, this);
  }

  readFloat64<T>(cx: KryoContext, input: unknown, visitor: ReadVisitor<T>): Result<T, CheckId> {
    const specialValues: Map<unknown, number> = new Map([
      ["-0", -0],
      ["NaN", NaN],
      ["Infinity", Infinity],
      ["+Infinity", Infinity],
      ["-Infinity", -Infinity],
    ]);
    const special: number | undefined = specialValues.get(input);
    if (special !== undefined) {
      return visitor.fromFloat64(special);
    } else if (typeof input === "number") {
      return visitor.fromFloat64(input);
    } else {
      return writeError(cx, {check: CheckKind.BaseType, expected: ["Float64"]} satisfies BaseTypeCheck);
    }
  }

  readList<T>(cx: KryoContext, input: any, visitor: ReadVisitor<T>): Result<T, CheckId> {
    if (!Array.isArray(input)) {
      return writeError(cx, {check: CheckKind.BaseType, expected: ["Array"]} satisfies BaseTypeCheck);
    }
    return visitor.fromList(input, this);
  }

  readMap<T>(cx: KryoContext, input: unknown, visitor: ReadVisitor<T>): Result<T, CheckId> {
    if (typeof input !== "object" || input === null) {
      return writeError(cx, {check: CheckKind.BaseType, expected: ["Record"]} satisfies BaseTypeCheck);
    }
    const jsonReader: JsonReader = new JsonReader();

    const inputMap: Map<any, any> = new Map();
    for (const rawKey in input) {
      let key: any;
      try {
        key = JSON.parse(rawKey);
        // key = (/* keyType */ undefined as any).read(jsonReader, key);
      } catch (err) {
        if (!(err instanceof Error)) {
          throw err;
        }
        return writeError(cx, {check: CheckKind.PropertyKey} satisfies PropertyKeyCheck);
      }
      inputMap.set(key, Reflect.get(input, rawKey));
    }
    return visitor.fromMap(inputMap, jsonReader, this);
  }

  readNull<T>(cx: KryoContext, input: any, visitor: ReadVisitor<T>): Result<T, CheckId> {
    if (this.trustInput) {
      return visitor.fromNull();
    }
    if (input !== null) {
      return writeError(cx, {check: CheckKind.BaseType, expected: ["Null"]});
    }
    return visitor.fromNull();
  }

  readString<T>(cx: KryoContext, input: any, visitor: ReadVisitor<T>): Result<T, CheckId> {
    if (typeof input !== "string") {
      return writeError(cx, {check: CheckKind.BaseType, expected: ["Ucs2String", "UsvString"]});
    }
    return visitor.fromString(input);
  }
}

export const BSON_VALUE_READER: BsonValueReader = new BsonValueReader();
