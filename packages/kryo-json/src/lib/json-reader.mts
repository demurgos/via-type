/**
 * @module kryo/readers/json
 */

import {CheckId, KryoContext, Reader, ReadVisitor, Result} from "kryo";

import {JsonValueReader} from "./json-value-reader.mjs";

export class JsonReader implements Reader<string> {
  trustInput?: boolean | undefined;

  private readonly valueReader: JsonValueReader;

  constructor(trust?: boolean) {
    this.trustInput = trust;
    this.valueReader = new JsonValueReader(trust);
  }

  readAny<T>(cx: KryoContext, raw: string, visitor: ReadVisitor<T>): Result<T, CheckId> {
    return this.valueReader.readAny(cx, JSON.parse(raw), visitor);
  }

  readBoolean<T>(cx: KryoContext, raw: string, visitor: ReadVisitor<T>): Result<T, CheckId> {
    return this.valueReader.readBoolean(cx, JSON.parse(raw), visitor);
  }

  readBytes<T>(cx: KryoContext, raw: string, visitor: ReadVisitor<T>): Result<T, CheckId> {
    return this.valueReader.readBytes(cx, JSON.parse(raw), visitor);
  }

  readDate<T>(cx: KryoContext, raw: string, visitor: ReadVisitor<T>): Result<T, CheckId> {
    return this.valueReader.readDate(cx, JSON.parse(raw), visitor);
  }

  readRecord<T>(cx: KryoContext, raw: any, visitor: ReadVisitor<T>): Result<T, CheckId> {
    return this.valueReader.readRecord(cx, JSON.parse(raw), visitor);
  }

  readFloat64<T>(cx: KryoContext, raw: string, visitor: ReadVisitor<T>): Result<T, CheckId> {
    return this.valueReader.readFloat64(cx, JSON.parse(raw), visitor);
  }

  readList<T>(cx: KryoContext, raw: any, visitor: ReadVisitor<T>): Result<T, CheckId> {
    return this.valueReader.readList(cx, JSON.parse(raw), visitor);
  }

  readMap<T>(cx: KryoContext, raw: any, visitor: ReadVisitor<T>): Result<T, CheckId> {
    return this.valueReader.readMap(cx, JSON.parse(raw), visitor);
  }

  readNull<T>(cx: KryoContext, raw: string, visitor: ReadVisitor<T>): Result<T, CheckId> {
    return this.valueReader.readNull(cx, JSON.parse(raw), visitor);
  }

  readString<T>(cx: KryoContext, raw: string, visitor: ReadVisitor<T>): Result<T, CheckId> {
    return this.valueReader.readString(cx, JSON.parse(raw), visitor);
  }
}

export const JSON_READER: JsonReader = new JsonReader();
