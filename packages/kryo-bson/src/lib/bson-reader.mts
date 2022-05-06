/**
 * @module kryo/readers/bson
 */

import { deserialize as bsonDeserialize } from "bson";
import { Reader, ReadVisitor } from "kryo";

import { BsonValueReader } from "./bson-value-reader.mjs";

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
    return this.valueReader.readAny(bsonDeserialize(raw)[this.primitiveWrapper], visitor);
  }

  readBoolean<R>(raw: Buffer, visitor: ReadVisitor<R>): R {
    return this.valueReader.readBoolean(bsonDeserialize(raw)[this.primitiveWrapper], visitor);
  }

  readBytes<R>(raw: Buffer, visitor: ReadVisitor<R>): R {
    return this.valueReader.readBytes(bsonDeserialize(raw)[this.primitiveWrapper], visitor);
  }

  readDate<R>(raw: Buffer, visitor: ReadVisitor<R>): R {
    return this.valueReader.readDate(bsonDeserialize(raw)[this.primitiveWrapper], visitor);
  }

  readRecord<R>(raw: any, visitor: ReadVisitor<R>): R {
    return this.valueReader.readRecord(bsonDeserialize(raw), visitor);
  }

  readFloat64<R>(raw: Buffer, visitor: ReadVisitor<R>): R {
    return this.valueReader.readFloat64(bsonDeserialize(raw)[this.primitiveWrapper], visitor);
  }

  readList<R>(raw: any, visitor: ReadVisitor<R>): R {
    return this.valueReader.readList(bsonDeserialize(raw)[this.primitiveWrapper], visitor);
  }

  readMap<R>(raw: any, visitor: ReadVisitor<R>): R {
    return this.valueReader.readMap(bsonDeserialize(raw), visitor);
  }

  readNull<R>(raw: Buffer, visitor: ReadVisitor<R>): R {
    return this.valueReader.readNull(bsonDeserialize(raw)[this.primitiveWrapper], visitor);
  }

  readString<R>(raw: Buffer, visitor: ReadVisitor<R>): R {
    return this.valueReader.readString(bsonDeserialize(raw)[this.primitiveWrapper], visitor);
  }
}

export const BSON_READER: BsonReader = new BsonReader();
