/**
 * @module kryo/readers/qs-value
 */

import {CheckId, KryoContext, Reader, ReadVisitor, Result, writeError} from "kryo";
import {BaseTypeCheck} from "kryo/checks/base-type";
import {CheckKind} from "kryo/checks/check-kind";
import {PropertyKeyCheck} from "kryo/checks/property-key";
import {JsonReader} from "kryo-json/json-reader";

export class QsValueReader implements Reader<any> {
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
        return writeError(cx, {check: CheckKind.BaseType, expected: ["Array", "Boolean", "Null", "Object", "UsvString", "Ucs2String"]} satisfies BaseTypeCheck);
    }
  }

  readBoolean<T>(cx: KryoContext, input: unknown, visitor: ReadVisitor<T>): Result<T, CheckId> {
    if (input !== "true" && input !== "false") {
      return writeError(cx, {check: CheckKind.BaseType, expected: ["Boolean"]} satisfies BaseTypeCheck);
    }
    return visitor.fromBoolean(input === "true");
  }

  readBytes<T>(cx: KryoContext, input: unknown, visitor: ReadVisitor<T>): Result<T, CheckId> {
    if (typeof input !== "string") {
      return writeError(cx, {check: CheckKind.BaseType, expected: ["Ucs2String", "UsvString", "Bytes"]} satisfies BaseTypeCheck);
    } else if (!/^(?:[0-9a-f]{2})*$/.test(input)) {
      return writeError(cx, {check: CheckKind.BaseType, expected: ["Ucs2String", "UsvString", "Bytes"]} satisfies BaseTypeCheck);
    }
    const len: number = input.length / 2;
    const result: Uint8Array = new Uint8Array(len);
    for (let i: number = 0; i < len; i++) {
      result[i] = parseInt(input.substring(2 * i, 2 * i + 2), 16);
    }
    return visitor.fromBytes(result);
  }

  readDate<T>(cx: KryoContext, input: unknown, visitor: ReadVisitor<T>): Result<T, CheckId> {
    if (this.trustInput) {
      return visitor.fromDate(new Date(input as number | string));
    }

    if (typeof input === "string") {
      return visitor.fromDate(new Date(input));
    }

    return writeError(cx, {check: CheckKind.BaseType, expected: ["Ucs2String", "Float64", "Sint53", "UsvString"]} satisfies BaseTypeCheck);
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
    } else if (typeof input === "string") {
      return visitor.fromFloat64(parseFloat(input));
    } else {
      return writeError(cx, {check: CheckKind.BaseType, expected: ["Float64"]} satisfies BaseTypeCheck);
    }
  }

  readList<T>(cx: KryoContext, input: unknown, visitor: ReadVisitor<T>): Result<T, CheckId> {
    if (input === undefined) {
      return visitor.fromList([], this);
    }
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

    const inputMap: Map<unknown, unknown> = new Map();
    for (const rawKey in input) {
      let key: unknown;
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

  readNull<T>(cx: KryoContext, input: unknown, visitor: ReadVisitor<T>): Result<T, CheckId> {
    if (this.trustInput) {
      return visitor.fromNull();
    }
    if (input !== "") {
      return writeError(cx, {check: CheckKind.BaseType, expected: ["Ucs2String", "UsvString"]} satisfies BaseTypeCheck);
    }
    return visitor.fromNull();
  }

  readString<T>(cx: KryoContext, input: unknown, visitor: ReadVisitor<T>): Result<T, CheckId> {
    if (typeof input !== "string") {
      return writeError(cx, {check: CheckKind.BaseType, expected: ["Ucs2String", "UsvString"]} satisfies BaseTypeCheck);
    }
    return visitor.fromString(input);
  }
}

export const QS_VALUE_READER: QsValueReader = new QsValueReader();
