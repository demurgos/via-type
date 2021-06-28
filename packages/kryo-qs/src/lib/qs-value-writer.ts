/**
 * @module kryo/writers/qs-value
 */

import { Writer } from "kryo";
import { StructuredWriter } from "kryo/lib/writers/structured";
import { JsonWriter } from "kryo-json/lib/json-writer";

export class QsValueWriter extends StructuredWriter {
  writeBoolean(value: boolean): "true" | "false" {
    return value ? "true" : "false";
  }

  writeBytes(value: Uint8Array): string {
    const result: string[] = new Array(value.length);
    const len: number = value.length;
    for (let i: number = 0; i < len; i++) {
      result[i] = (value[i] < 16 ? "0" : "") + value[i].toString(16);
    }
    return result.join("");
  }

  writeDate(value: Date): string {
    return value.toISOString();
  }

  writeFloat64(value: number): string {
    if (isNaN(value)) {
      return "NaN";
    } else if (value === Infinity) {
      return "+Infinity";
    } else if (value === -Infinity) {
      return "-Infinity";
    }
    return value.toString(10);
  }

  writeNull(): "" {
    return "";
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

  writeString(value: string): string {
    return value;
  }
}

export const QS_VALUE_WRITER: QsValueWriter = new QsValueWriter();
