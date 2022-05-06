/**
 * @module kryo/writers/json-stream
 */

import { Writer } from "kryo";

export interface WritableStream {
  /**
   * Write a string to the stream.
   *
   * @param chunk Chunk of UCS2 code units, they must be encoded as UTF-8.
   * @return Boolean indicating that the stream can accept more data.
   */
  write(chunk: string): boolean;
}

export class JsonStreamWriter implements Writer<boolean> {
  private readonly stream: WritableStream;

  constructor(stream: WritableStream) {
    this.stream = stream;
  }

  writeAny(value: any): boolean {
    return this.stream.write(JSON.stringify(value));
  }

  writeBoolean(value: boolean): boolean {
    return this.stream.write(value ? "true" : "false");
  }

  writeBytes(value: Uint8Array): boolean {
    const result: string[] = new Array(value.length);
    const len: number = value.length;
    for (let i: number = 0; i < len; i++) {
      result[i] = (value[i] < 16 ? "0" : "") + value[i].toString(16);
    }
    return this.writeString(result.join(""));
  }

  writeRecord<K extends string>(
    keys: Iterable<K>,
    handler: (key: K, fieldWriter: Writer<boolean>) => boolean,
  ): boolean {
    let shouldContinue: boolean = true;
    shouldContinue = this.stream.write("{") && shouldContinue;
    let first: boolean = true;
    for (const key of keys) {
      if (!first) {
        shouldContinue = this.stream.write(",") && shouldContinue;
      }
      shouldContinue = this.writeString(key) && shouldContinue;
      shouldContinue = this.stream.write(":") && shouldContinue;
      shouldContinue = handler(key, this) && shouldContinue;
      first = false;
    }
    return this.stream.write("}") && shouldContinue;
  }

  writeFloat64(value: number): boolean {
    if (isNaN(value)) {
      return this.writeString("NaN");
    } else if (value === Infinity) {
      return this.writeString("+Infinity");
    } else if (value === -Infinity) {
      return this.writeString("-Infinity");
    } else if (Object.is(value, -0)) {
      return this.writeString("-0");
    }
    return this.stream.write(value.toString(10));
  }

  writeDate(value: Date): boolean {
    return this.writeString(value.toISOString());
  }

  writeList(size: number, handler: (index: number, itemWriter: Writer<boolean>) => boolean): boolean {
    let shouldContinue: boolean = true;
    shouldContinue = this.stream.write("[") && shouldContinue;
    for (let index: number = 0; index < size; index++) {
      if (index > 0) {
        shouldContinue = this.stream.write(",") && shouldContinue;
      }
      shouldContinue = handler(index, this) && shouldContinue;
    }
    return this.stream.write("]") && shouldContinue;
  }

  writeNull(): boolean {
    return this.stream.write("null");
  }

  writeMap(
    size: number,
    keyHandler: (index: number, mapKeyWriter: Writer<boolean>) => boolean,
    valueHandler: (index: number, mapValueWriter: Writer<boolean>) => boolean,
  ): boolean {
    let shouldContinue: boolean = true;
    shouldContinue = this.stream.write("{") && shouldContinue;
    for (let index: number = 0; index < size; index++) {
      if (index > 0) {
        shouldContinue = this.stream.write(",") && shouldContinue;
      }
      const chunks: string[] = [];
      const subStream: JsonStreamWriter = new JsonStreamWriter({
        write(chunk: string): boolean {
          chunks.push(chunk);
          return shouldContinue;
        },
      });
      shouldContinue = keyHandler(index, subStream) && shouldContinue;
      shouldContinue = this.writeString(chunks.join("")) && shouldContinue;
      shouldContinue = this.stream.write(":") && shouldContinue;
      shouldContinue = valueHandler(index, this) && shouldContinue;
    }
    return this.stream.write("}") && shouldContinue;
  }

  writeString(value: string): boolean {
    return this.stream.write(JSON.stringify(value));
  }
}
