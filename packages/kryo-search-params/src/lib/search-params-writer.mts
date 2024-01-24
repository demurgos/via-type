import {Writer} from "kryo";

import {SearchParamsValueWriter} from "./search-params-value-writer.mjs";

export class SearchParamsWriter implements Writer<string> {
  readonly #valueWriter: SearchParamsValueWriter;
  readonly #primitiveWrapper: string;

  constructor(primitiveWrapper: string = "_") {
    this.#primitiveWrapper = primitiveWrapper;
    this.#valueWriter = new SearchParamsValueWriter();
  }

  writeAny(value: number): string {
    return new URLSearchParams({[this.#primitiveWrapper]: this.#valueWriter.writeAny(value)}).toString();
  }

  writeBoolean(value: boolean): string {
    return new URLSearchParams({[this.#primitiveWrapper]: this.#valueWriter.writeBoolean(value)}).toString();
  }

  writeBytes(value: Uint8Array): string {
    return new URLSearchParams({[this.#primitiveWrapper]: this.#valueWriter.writeBytes(value)}).toString();
  }

  writeDate(value: Date): string {
    return new URLSearchParams({[this.#primitiveWrapper]: this.#valueWriter.writeDate(value)}).toString();
  }

  writeRecord<K extends string>(
    keys: Iterable<K>,
    handler: (key: K, fieldWriter: Writer<any>) => any,
  ): string {
    return this.#valueWriter.writeRecord(keys, handler).toString();
  }

  writeFloat64(value: number): string {
    return new URLSearchParams({[this.#primitiveWrapper]: this.#valueWriter.writeFloat64(value)}).toString();
  }

  writeList(size: number, handler: (index: number, itemWriter: Writer<any>) => any): string {
    return new URLSearchParams({[this.#primitiveWrapper]: this.#valueWriter.writeList(size, handler)}).toString();
  }

  writeMap(
    size: number,
    keyHandler: <KW>(index: number, mapKeyWriter: Writer<KW>) => KW,
    valueHandler: <VW>(index: number, mapValueWriter: Writer<VW>) => VW,
  ): any {
    return this.#valueWriter.writeMap(size, keyHandler, valueHandler).toString();
  }

  writeNull(): string {
    return new URLSearchParams({[this.#primitiveWrapper]: this.#valueWriter.writeNull()}).toString();
  }

  writeString(value: string): string {
    return new URLSearchParams({[this.#primitiveWrapper]: this.#valueWriter.writeString(value)}).toString();
  }
}

export const SEARCH_PARAMS_WRITER: SearchParamsWriter = new SearchParamsWriter();
