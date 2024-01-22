/**
 * @module kryo/readers/bson
 */

import {deserialize as bsonDeserialize} from "bson";
import {CheckId, KryoContext,Reader, ReadVisitor, Result} from "kryo";

import {BsonValueReader} from "./bson-value-reader.mjs";

export class BsonReader implements Reader<Buffer> {
  trustInput?: boolean | undefined;

  private readonly valueReader: BsonValueReader;

  private readonly primitiveWrapper: string;

  constructor(trust?: boolean, primitiveWrapper: string = "_") {
    this.trustInput = trust;
    this.primitiveWrapper = primitiveWrapper;
    this.valueReader = new BsonValueReader(trust);
  }

  readAny<T>(cx: KryoContext, raw: Buffer, visitor: ReadVisitor<T>): Result<T, CheckId> {
    return this.valueReader.readAny(cx, bsonDeserialize(raw)[this.primitiveWrapper], visitor);
  }

  readBoolean<T>(cx: KryoContext, raw: Buffer, visitor: ReadVisitor<T>): Result<T, CheckId> {
    return this.valueReader.readBoolean(cx, bsonDeserialize(raw)[this.primitiveWrapper], visitor);
  }

  readBytes<T>(cx: KryoContext, raw: Buffer, visitor: ReadVisitor<T>): Result<T, CheckId> {
    return this.valueReader.readBytes(cx, bsonDeserialize(raw)[this.primitiveWrapper], visitor);
  }

  readDate<T>(cx: KryoContext, raw: Buffer, visitor: ReadVisitor<T>): Result<T, CheckId> {
    return this.valueReader.readDate(cx, bsonDeserialize(raw)[this.primitiveWrapper], visitor);
  }

  readRecord<T>(cx: KryoContext, raw: any, visitor: ReadVisitor<T>): Result<T, CheckId> {
    return this.valueReader.readRecord(cx, bsonDeserialize(raw), visitor);
  }

  readFloat64<T>(cx: KryoContext, raw: Buffer, visitor: ReadVisitor<T>): Result<T, CheckId> {
    return this.valueReader.readFloat64(cx, bsonDeserialize(raw)[this.primitiveWrapper], visitor);
  }

  readList<T>(cx: KryoContext, raw: any, visitor: ReadVisitor<T>): Result<T, CheckId> {
    return this.valueReader.readList(cx, bsonDeserialize(raw)[this.primitiveWrapper], visitor);
  }

  readMap<T>(cx: KryoContext, raw: any, visitor: ReadVisitor<T>): Result<T, CheckId> {
    return this.valueReader.readMap(cx, bsonDeserialize(raw), visitor);
  }

  readNull<T>(cx: KryoContext, raw: Buffer, visitor: ReadVisitor<T>): Result<T, CheckId> {
    return this.valueReader.readNull(cx, bsonDeserialize(raw)[this.primitiveWrapper], visitor);
  }

  readString<T>(cx: KryoContext, raw: Buffer, visitor: ReadVisitor<T>): Result<T, CheckId> {
    return this.valueReader.readString(cx, bsonDeserialize(raw)[this.primitiveWrapper], visitor);
  }
}

export const BSON_READER: BsonReader = new BsonReader();
