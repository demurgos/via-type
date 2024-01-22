/**
 * @module kryo/writers/bson
 */

import { serialize as bsonSerialize } from "bson";
import { Writer } from "kryo";

import { BsonValueWriter } from "./bson-value-writer.mjs";

export class BsonWriter implements Writer<Uint8Array> {
  private readonly valueWriter: BsonValueWriter;
  private readonly primitiveWrapper: string;

  constructor(primitiveWrapper: string = "_") {
    this.primitiveWrapper = primitiveWrapper;
    this.valueWriter = new BsonValueWriter();
  }

  writeAny(value: number): Uint8Array {
    return bsonSerialize({[this.primitiveWrapper]: this.valueWriter.writeAny(value)});
  }

  writeBoolean(value: boolean): Uint8Array {
    return bsonSerialize({[this.primitiveWrapper]: this.valueWriter.writeBoolean(value)});
  }

  writeBytes(value: Uint8Array): Uint8Array {
    return bsonSerialize({[this.primitiveWrapper]: this.valueWriter.writeBytes(value)});
  }

  writeDate(value: Date): Uint8Array {
    return bsonSerialize({[this.primitiveWrapper]: this.valueWriter.writeDate(value)});
  }

  writeRecord<K extends string>(
    keys: Iterable<K>,
    handler: (key: K, fieldWriter: Writer<any>) => any,
  ): Uint8Array {
    return bsonSerialize(this.valueWriter.writeRecord(keys, handler));
  }

  writeFloat64(value: number): Uint8Array {
    return bsonSerialize({[this.primitiveWrapper]: this.valueWriter.writeFloat64(value)});
  }

  writeList(size: number, handler: (index: number, itemWriter: Writer<any>) => any): Uint8Array {
    return bsonSerialize({[this.primitiveWrapper]: this.valueWriter.writeList(size, handler)});
  }

  writeMap(
    size: number,
    keyHandler: <KW>(index: number, mapKeyWriter: Writer<KW>) => KW,
    valueHandler: <VW>(index: number, mapValueWriter: Writer<VW>) => VW,
  ): Uint8Array {
    return bsonSerialize(this.valueWriter.writeMap(size, keyHandler, valueHandler));
  }

  writeNull(): Uint8Array {
    return bsonSerialize({[this.primitiveWrapper]: this.valueWriter.writeNull()});
  }

  writeString(value: string): Uint8Array {
    return bsonSerialize({[this.primitiveWrapper]: this.valueWriter.writeString(value)});
  }
}

export const BSON_WRITER: BsonWriter = new BsonWriter();
