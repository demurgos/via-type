/**
 * @module kryo/readers/json-value
 */

import {CheckId, KryoContext, Reader, ReadVisitor, Result,writeError} from "kryo";
import {BaseTypeCheck} from "kryo/checks/base-type";
import {CheckKind} from "kryo/checks/check-kind";
import {PropertyKeyCheck} from "kryo/checks/property-key";

import {JsonValue} from "./json-value.mjs";

export class JsonValueReader implements Reader<JsonValue> {
  trustInput?: boolean | undefined;

  constructor(trust?: boolean) {
    this.trustInput = trust;
  }

  readAny<T>(cx: KryoContext, raw: JsonValue, visitor: ReadVisitor<T>): Result<T, CheckId> {
    switch (typeof raw) {
      case "boolean":
        return visitor.fromBoolean(raw as boolean);
      case "string":
        return visitor.fromString(raw as string);
      case "object":
        return raw === null
          ? visitor.fromNull()
          : visitor.fromMap(new Map(Object.keys(raw).map(k => [k, Reflect.get(raw, k)] as [string, unknown])), this, this);
      default:
        return writeError(cx, {check: CheckKind.BaseType, expected: ["Array", "Boolean", "Null", "Object", "UsvString", "Ucs2String"]} satisfies BaseTypeCheck);
    }
  }

  readBoolean<T>(cx: KryoContext, raw: JsonValue, visitor: ReadVisitor<T>): Result<T, CheckId> {
    if (typeof raw !== "boolean") {
      return writeError(cx, {check: CheckKind.BaseType, expected: ["Boolean"]} satisfies BaseTypeCheck);
    }
    return visitor.fromBoolean(raw);
  }

  readBytes<T>(cx: KryoContext, raw: JsonValue, visitor: ReadVisitor<T>): Result<T, CheckId> {
    if (typeof raw !== "string") {
      return writeError(cx, {check: CheckKind.BaseType, expected: ["UsvString", "Ucs2String", "Bytes"]} satisfies BaseTypeCheck);
    } else if (!/^(?:[0-9a-f]{2})*$/.test(raw)) {
      return writeError(cx, {check: CheckKind.BaseType, expected: ["UsvString", "Ucs2String", "Bytes"]} satisfies BaseTypeCheck);
    }
    const len: number = raw.length / 2;
    const result: Uint8Array = new Uint8Array(len);
    for (let i: number = 0; i < len; i++) {
      result[i] = parseInt(raw.substring(2 * i, 2 * i + 2), 16);
    }
    return visitor.fromBytes(result);
  }

  readDate<T>(cx: KryoContext, raw: JsonValue, visitor: ReadVisitor<T>): Result<T, CheckId> {
    if (this.trustInput) {
      return visitor.fromDate(new Date(raw as any));
    }

    if (typeof raw === "string") {
      return visitor.fromDate(new Date(raw));
    } else if (typeof raw === "number") {
      return visitor.fromDate(new Date(raw));
    }
    return writeError(cx, {check: CheckKind.BaseType, expected: ["UsvString", "Ucs2String", "Float64", "Sint53"]} satisfies BaseTypeCheck);
  }

  readRecord<T>(cx: KryoContext, raw: JsonValue, visitor: ReadVisitor<T>): Result<T, CheckId> {
    if (typeof raw !== "object" || raw === null) {
      return writeError(cx, {check: CheckKind.BaseType, expected: ["Record"]} satisfies BaseTypeCheck);
    }
    const input: Map<string, any> = new Map();
    for (const key in raw) {
      input.set(key, Reflect.get(raw, key));
    }
    return visitor.fromMap(input, this, this);
  }

  readFloat64<T>(cx: KryoContext, raw: JsonValue, visitor: ReadVisitor<T>): Result<T, CheckId> {
    const specialValues: Map<unknown, number> = new Map([
      ["-0", -0],
      ["NaN", NaN],
      ["Infinity", Infinity],
      ["+Infinity", Infinity],
      ["-Infinity", -Infinity],
    ]);
    const special: number | undefined = specialValues.get(raw);
    if (special !== undefined) {
      return visitor.fromFloat64(special);
    } else if (typeof raw === "number") {
      return visitor.fromFloat64(raw);
    } else {
      return writeError(cx, {check: CheckKind.BaseType, expected: ["Float64"]} satisfies BaseTypeCheck);
    }
  }

  readList<T>(cx: KryoContext, raw: JsonValue, visitor: ReadVisitor<T>): Result<T, CheckId> {
    if (!Array.isArray(raw)) {
      return writeError(cx, {check: CheckKind.BaseType, expected: ["Array"]} satisfies BaseTypeCheck);
    }
    return visitor.fromList(raw, this);
  }

  readMap<T>(cx: KryoContext, raw: JsonValue, visitor: ReadVisitor<T>): Result<T, CheckId> {
    if (typeof raw !== "object" || raw === null) {
      return writeError(cx, {check: CheckKind.BaseType, expected: ["Record"]} satisfies BaseTypeCheck);
    }
    const keyReader: JsonValueReader = new JsonValueReader();

    const input: Map<string, unknown> = new Map();
    for (const rawKey in raw) {
      let key: any;
      try {
        key = JSON.parse(rawKey);
        // key = (/* keyType */ undefined as any).read(jsonReader, key);
      } catch (err) {
        if (!(err instanceof Error)) {
          throw err;
        }
        // key is not valid JSON
        return writeError(cx, {check: CheckKind.PropertyKey} satisfies PropertyKeyCheck);
      }
      input.set(key, Reflect.get(raw, rawKey));
    }
    return visitor.fromMap(input, keyReader, this);
  }

  readNull<T>(cx: KryoContext, raw: JsonValue, visitor: ReadVisitor<T>): Result<T, CheckId> {
    if (this.trustInput) {
      return visitor.fromNull();
    }
    if (raw !== null) {
      return writeError(cx, {check: CheckKind.BaseType, expected: ["Null"]});
    }
    return visitor.fromNull();
  }

  readString<T>(cx: KryoContext, raw: JsonValue, visitor: ReadVisitor<T>): Result<T, CheckId> {
    if (typeof raw !== "string") {
      return writeError(cx, {check: CheckKind.BaseType, expected: ["Ucs2String", "UsvString"]});
    }
    return visitor.fromString(raw);
  }
}

export const JSON_VALUE_READER: JsonValueReader = new JsonValueReader();
