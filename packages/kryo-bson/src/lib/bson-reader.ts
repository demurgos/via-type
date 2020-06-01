/**
 * @module kryo/readers/bson
 */

import BSON from "bson";
import { Reader, ReadVisitor } from "kryo";

import { BsonValueReader } from "./bson-value-reader.js";

export class BsonReader implements Reader<Buffer> {
  trustInput?: boolean | undefined;

  private readonly valueReader: BsonValueReader;

  private readonly primitiveWrapper: string;

  constructor(trust?: boolean, primitiveWrapper: string = "_") {
    this.trustInput = trust;
    this.primitiveWrapper = primitiveWrapper;
    this.valueReader = new BsonValueReader(trust);
  }

  readAny<R>(raw: Buffer, visitor: ReadVisitor<R>): R {
    return this.valueReader.readAny(BSON.deserialize(raw)[this.primitiveWrapper], visitor);
  }

  readBoolean<R>(raw: Buffer, visitor: ReadVisitor<R>): R {
    return this.valueReader.readBoolean(BSON.deserialize(raw)[this.primitiveWrapper], visitor);
  }

  readBytes<R>(raw: Buffer, visitor: ReadVisitor<R>): R {
    return this.valueReader.readBytes(BSON.deserialize(raw)[this.primitiveWrapper], visitor);
  }

  readDate<R>(raw: Buffer, visitor: ReadVisitor<R>): R {
    return this.valueReader.readDate(BSON.deserialize(raw)[this.primitiveWrapper], visitor);
  }

  readRecord<R>(raw: any, visitor: ReadVisitor<R>): R {
    return this.valueReader.readRecord(BSON.deserialize(raw), visitor);
  }

  readFloat64<R>(raw: Buffer, visitor: ReadVisitor<R>): R {
    return this.valueReader.readFloat64(BSON.deserialize(raw)[this.primitiveWrapper], visitor);
  }

  readList<R>(raw: any, visitor: ReadVisitor<R>): R {
    return this.valueReader.readList(BSON.deserialize(raw)[this.primitiveWrapper], visitor);
  }

  readMap<R>(raw: any, visitor: ReadVisitor<R>): R {
    return this.valueReader.readMap(BSON.deserialize(raw), visitor);
  }

  readNull<R>(raw: Buffer, visitor: ReadVisitor<R>): R {
    return this.valueReader.readNull(BSON.deserialize(raw)[this.primitiveWrapper], visitor);
  }

  readString<R>(raw: Buffer, visitor: ReadVisitor<R>): R {
    return this.valueReader.readString(BSON.deserialize(raw)[this.primitiveWrapper], visitor);
  }
}

export const BSON_READER: BsonReader = new BsonReader();
