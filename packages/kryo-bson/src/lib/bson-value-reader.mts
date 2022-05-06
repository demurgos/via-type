/**
 * @module kryo/readers/bson-value
 */

import { Binary } from "bson";
import incident from "incident";
import { Reader, ReadVisitor } from "kryo";
import { createInvalidTypeError } from "kryo/errors/invalid-type";
import { JsonReader } from "kryo-json/json-reader";

function isBinary(val: any): val is Binary {
  return val._bsontype === "Binary";
}

export class BsonValueReader implements Reader<any> {
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
    if (typeof input !== "boolean") {
      throw createInvalidTypeError("boolean", input);
    }
    return visitor.fromBoolean(input);
  }

  readBytes<R>(raw: any, visitor: ReadVisitor<R>): R {
    let input: Uint8Array;
    if (isBinary(raw)) {
      // TODO: Fix BSON type definitions
      input = (raw as {value(asRaw: true): Buffer}).value(true);
    } else {
      // TODO: typecheck
      input = raw;
    }
    return visitor.fromBytes(input);
  }

  readDate<R>(raw: any, visitor: ReadVisitor<R>): R {
    if (!(raw instanceof Date)) {
      throw createInvalidTypeError("Date", raw);
    }
    return visitor.fromDate(new Date(raw.getTime()));
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
    const specialValues: Map<string, number> = new Map([["NaN", NaN], ["Infinity", Infinity], ["-Infinity", Infinity]]);
    const special: number | undefined = specialValues.get(input);
    if (special === undefined && typeof input !== "number") {
      throw new incident.Incident("InvalidInput", {input, expected: "float64"});
    }
    return visitor.fromFloat64(special !== undefined ? special : input);
  }

  readList<R>(input: any, visitor: ReadVisitor<R>): R {
    if (!Array.isArray(input)) {
      throw createInvalidTypeError("array", input);
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
        throw new incident.Incident(err, "InvalidMapKey", {rawKey});
      }
      input.set(key, raw[rawKey]);
    }
    return visitor.fromMap(input, jsonReader, this);
  }

  readNull<R>(input: any, visitor: ReadVisitor<R>): R {
    if (this.trustInput) {
      return visitor.fromNull();
    }
    if (input !== null) {
      throw createInvalidTypeError("null", input);
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

export const BSON_VALUE_READER: BsonValueReader = new BsonValueReader();
