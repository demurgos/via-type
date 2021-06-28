/**
 * @module kryo/readers/json-value
 */

import incident from "incident";
import { Reader, ReadVisitor } from "kryo";
import { createInvalidTypeError } from "kryo/lib/errors/invalid-type";

import { JsonValue } from "./json-value.js";

export class JsonValueReader implements Reader<JsonValue> {
  trustInput?: boolean | undefined;

  constructor(trust?: boolean) {
    this.trustInput = trust;
  }

  readAny<R>(raw: JsonValue, visitor: ReadVisitor<R>): R {
    switch (typeof raw) {
      case "boolean":
        return visitor.fromBoolean(raw as boolean);
      case "string":
        return visitor.fromString(raw as string);
      case "object":
        return raw === null
          ? visitor.fromNull()
          : visitor.fromMap(new Map(Object.keys(raw).map(k => [k, (raw as any)[k]] as [string, any])), this, this);
      default:
        throw createInvalidTypeError("array | boolean | null | object | string", raw);
    }
  }

  readBoolean<R>(raw: JsonValue, visitor: ReadVisitor<R>): R {
    if (typeof raw !== "boolean") {
      throw createInvalidTypeError("boolean", raw);
    }
    return visitor.fromBoolean(raw);
  }

  readBytes<R>(raw: JsonValue, visitor: ReadVisitor<R>): R {
    if (typeof raw !== "string") {
      throw createInvalidTypeError("string", raw);
    } else if (!/^(?:[0-9a-f]{2})*$/.test(raw)) {
      throw createInvalidTypeError("lowerCaseHexEvenLengthString", raw);
    }
    const len: number = raw.length / 2;
    const result: Uint8Array = new Uint8Array(len);
    for (let i: number = 0; i < len; i++) {
      result[i] = parseInt(raw.substr(2 * i, 2), 16);
    }
    return visitor.fromBytes(result);
  }

  readDate<R>(raw: JsonValue, visitor: ReadVisitor<R>): R {
    if (this.trustInput) {
      return visitor.fromDate(new Date(raw as any));
    }

    if (typeof raw === "string") {
      return visitor.fromDate(new Date(raw));
    } else if (typeof raw === "number") {
      return visitor.fromDate(new Date(raw));
    }
    throw createInvalidTypeError("string | number", raw);
  }

  readRecord<R>(raw: any, visitor: ReadVisitor<R>): R {
    if (typeof raw !== "object" || raw === null) {
      throw createInvalidTypeError("object", raw);
    }
    const input: Map<string, any> = new Map();
    for (const key in raw) {
      input.set(key, raw[key]);
    }
    return visitor.fromMap(input, this, this);
  }

  readFloat64<R>(raw: JsonValue, visitor: ReadVisitor<R>): R {
    const specialValues: Map<any, number> = new Map([
      ["NaN", NaN],
      ["Infinity", Infinity],
      ["+Infinity", Infinity],
      ["-Infinity", -Infinity],
    ]);
    const special: number | undefined = specialValues.get(raw);
    if (special === undefined && typeof raw !== "number") {
      throw new incident.Incident("InvalidInput", {raw, expected: "float64"});
    }
    return visitor.fromFloat64(special !== undefined ? special : raw as number);
  }

  readList<R>(raw: any, visitor: ReadVisitor<R>): R {
    if (!Array.isArray(raw)) {
      throw createInvalidTypeError("array", raw);
    }
    return visitor.fromList(raw, this);
  }

  readMap<R>(raw: any, visitor: ReadVisitor<R>): R {
    if (typeof raw !== "object" || raw === null) {
      throw createInvalidTypeError("object", raw);
    }
    const keyReader: JsonValueReader = new JsonValueReader();

    const input: Map<any, any> = new Map();
    for (const rawKey in raw) {
      let key: any;
      try {
        key = JSON.parse(rawKey);
        // key = (/* keyType */ undefined as any).read(jsonReader, key);
      } catch (err) {
        throw new incident.Incident(err, "InvalidMapKey", {rawKey});
      }
      input.set(key, raw[rawKey]);
    }
    return visitor.fromMap(input, keyReader, this);
  }

  readNull<R>(raw: JsonValue, visitor: ReadVisitor<R>): R {
    if (this.trustInput) {
      return visitor.fromNull();
    }
    if (raw !== null) {
      throw createInvalidTypeError("null", raw);
    }
    return visitor.fromNull();
  }

  readString<R>(raw: JsonValue, visitor: ReadVisitor<R>): R {
    if (typeof raw !== "string") {
      throw createInvalidTypeError("string", raw);
    }
    return visitor.fromString(raw);
  }
}

export const JSON_VALUE_READER: JsonValueReader = new JsonValueReader();
