/**
 * @module kryo/readers/json
 */

import { Reader, ReadVisitor } from "kryo";

import { JsonValueReader } from "./json-value-reader.mjs";

export class JsonReader implements Reader<string> {
  trustInput?: boolean | undefined;

  private readonly valueReader: JsonValueReader;

  constructor(trust?: boolean) {
    this.trustInput = trust;
    this.valueReader = new JsonValueReader(trust);
  }

  readAny<R>(raw: string, visitor: ReadVisitor<R>): R {
    return this.valueReader.readAny(JSON.parse(raw), visitor);
  }

  readBoolean<R>(raw: string, visitor: ReadVisitor<R>): R {
    return this.valueReader.readBoolean(JSON.parse(raw), visitor);
  }

  readBytes<R>(raw: string, visitor: ReadVisitor<R>): R {
    return this.valueReader.readBytes(JSON.parse(raw), visitor);
  }

  readDate<R>(raw: string, visitor: ReadVisitor<R>): R {
    return this.valueReader.readDate(JSON.parse(raw), visitor);
  }

  readRecord<R>(raw: any, visitor: ReadVisitor<R>): R {
    return this.valueReader.readRecord(JSON.parse(raw), visitor);
  }

  readFloat64<R>(raw: string, visitor: ReadVisitor<R>): R {
    return this.valueReader.readFloat64(JSON.parse(raw), visitor);
  }

  readList<R>(raw: any, visitor: ReadVisitor<R>): R {
    return this.valueReader.readList(JSON.parse(raw), visitor);
  }

  readMap<R>(raw: any, visitor: ReadVisitor<R>): R {
    return this.valueReader.readMap(JSON.parse(raw), visitor);
  }

  readNull<R>(raw: string, visitor: ReadVisitor<R>): R {
    return this.valueReader.readNull(JSON.parse(raw), visitor);
  }

  readString<R>(raw: string, visitor: ReadVisitor<R>): R {
    return this.valueReader.readString(JSON.parse(raw), visitor);
  }
}

export const JSON_READER: JsonReader = new JsonReader();
