/**
 * @module kryo/writers/bson-value
 */

import BSON from "bson";
import { Writer } from "kryo";
import { JsonWriter } from "kryo-json/lib/json-writer.js";
import { StructuredWriter } from "kryo/lib/writers/structured.js";

export class BsonValueWriter extends StructuredWriter {
  constructor() {
    super();
  }

  writeFloat64(value: number): number {
    return value;
  }

  writeBoolean(value: boolean): boolean {
    return value;
  }

  writeNull(): null {
    return null;
  }

  writeBytes(value: Uint8Array): BSON.Binary {
    // TODO: Update Node type definitions
    return new BSON.Binary(Buffer.from(value as any));
  }

  writeDate(value: Date): Date {
    return new Date(value.getTime());
  }

  writeString(value: string): string {
    return value;
  }

  writeMap(
    size: number,
    keyHandler: <KW>(index: number, mapKeyWriter: Writer<KW>) => KW,
    valueHandler: <VW>(index: number, mapValueWriter: Writer<VW>) => VW,
  ): any {
    const result: any = {};
    for (let index: number = 0; index < size; index++) {
      // TODO: Use a specialized writer that only accepts strings and numbers (KeyMustBeAStringError)
      // Let users build custom serializers if they want
      const jsonWriter: JsonWriter = new JsonWriter();
      const key: any = keyHandler(index, jsonWriter);
      result[JSON.stringify(key)] = valueHandler(index, this);
    }
    return result;
  }
}

export const BSON_VALUE_WRITER: BsonValueWriter = new BsonValueWriter();
