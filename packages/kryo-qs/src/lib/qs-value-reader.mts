/**
 * @module kryo/readers/qs-value
 */

import incident from "incident";
import { Reader, ReadVisitor } from "kryo";
import { createInvalidTypeError } from "kryo/errors/invalid-type";
import { JsonReader } from "kryo-json/json-reader";

export class QsValueReader implements Reader<any> {
  trustInput?: boolean | undefined;

  constructor(trust?: boolean) {
    this.trustInput = trust;
  }

  readAny<R>(input: any, visitor: ReadVisitor<R>): R {
    switch (typeof input) {
      case "boolean":
        return visitor.fromBoolean(input);
      case "string":
        return visitor.fromString(input);
      case "object":
        return input === null
          ? visitor.fromNull()
          : visitor.fromMap(new Map(Object.keys(input).map(k => [k, input[k]] as [string, any])), this, this);
      default:
        throw createInvalidTypeError("boolean | null | object | string", input);
    }
  }

  readBoolean<R>(input: any, visitor: ReadVisitor<R>): R {
    if (input !== "true" && input !== "false") {
      throw createInvalidTypeError("\"true\" | \"false\"", input);
    }
    return visitor.fromBoolean(input === "true");
  }

  readBytes<R>(input: any, visitor: ReadVisitor<R>): R {
    if (typeof input !== "string") {
      throw createInvalidTypeError("string", input);
    } else if (!/^(?:[0-9a-f]{2})*$/.test(input)) {
      throw createInvalidTypeError("lowerCaseHexEvenLengthString", input);
    }
    const len: number = input.length / 2;
    const result: Uint8Array = new Uint8Array(len);
    for (let i: number = 0; i < len; i++) {
      result[i] = parseInt(input.substr(2 * i, 2), 16);
    }
    return visitor.fromBytes(result);
  }

  readDate<R>(input: any, visitor: ReadVisitor<R>): R {
    if (this.trustInput) {
      return visitor.fromDate(new Date(input));
    }

    if (typeof input === "string") {
      return visitor.fromDate(new Date(input));
    }

    throw createInvalidTypeError("string | number", input);
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

  readFloat64<R>(input: any, visitor: ReadVisitor<R>): R {
    const specialValues: Map<string, number> = new Map([
      ["NaN", NaN],
      ["Infinity", Infinity],
      ["+Infinity", Infinity],
      ["-Infinity", -Infinity],
    ]);
    const special: number | undefined = specialValues.get(input);
    if (special === undefined && typeof input !== "string") {
      throw new incident.Incident("InvalidInput", {input, expected: "float64"});
    }
    return visitor.fromFloat64(special !== undefined ? special : parseFloat(input));
  }

  readList<R>(input: any, visitor: ReadVisitor<R>): R {
    if (input === undefined) {
      return visitor.fromList([], this);
    }
    if (!Array.isArray(input)) {
      throw createInvalidTypeError("array | undefined", input);
    }
    return visitor.fromList(input, this);
  }

  readMap<R>(raw: any, visitor: ReadVisitor<R>): R {
    if (typeof raw !== "object" || raw === null) {
      throw createInvalidTypeError("object", raw);
    }
    const jsonReader: JsonReader = new JsonReader();

    const input: Map<any, any> = new Map();
    for (const rawKey in raw) {
      let key: any;
      try {
        key = JSON.parse(rawKey);
        // key = (/* keyType */ undefined as any).read(jsonReader, key);
      } catch (err) {
        if (!(err instanceof Error)) {
          throw err;
        }
        throw new incident.Incident(err, "InvalidMapKey", rawKey);
      }
      input.set(key, raw[rawKey]);
    }
    return visitor.fromMap(input, jsonReader, this);
  }

  readNull<R>(input: any, visitor: ReadVisitor<R>): R {
    if (this.trustInput) {
      return visitor.fromNull();
    }
    if (input !== "") {
      throw createInvalidTypeError("\"\"", input);
    }
    return visitor.fromNull();
  }

  readString<R>(input: any, visitor: ReadVisitor<R>): R {
    if (typeof input !== "string") {
      throw createInvalidTypeError("string", input);
    }
    return visitor.fromString(input);
  }
}

export const QS_VALUE_READER: QsValueReader = new QsValueReader();
