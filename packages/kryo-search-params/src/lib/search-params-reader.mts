import {CheckId, KryoContext, Reader, ReadVisitor, Result, writeError} from "kryo";
import {SearchParamsValueReader} from "./search-params-value-reader.mjs";
import {CheckKind} from "kryo/checks/check-kind";
import {SearchParamsRootReader} from "./search-params-root-reader.mjs";

export function parseSearch(searchStr: string): URLSearchParams {
  return new URLSearchParams(searchStr);
}

export class SearchParamsReader implements Reader<string> {
  public readonly trustInput?: boolean | undefined;
  readonly #valueReader: SearchParamsValueReader;
  readonly #rootReader: SearchParamsRootReader;
  readonly #primitiveWrapper: string;

  constructor(trust?: boolean, primitiveWrapper: string = "_") {
    this.trustInput = trust;
    this.#primitiveWrapper = primitiveWrapper;
    this.#valueReader = new SearchParamsValueReader(trust);
    this.#rootReader = new SearchParamsRootReader(trust);
  }

  readAny<T>(cx: KryoContext, raw: string, visitor: ReadVisitor<T>): Result<T, CheckId> {
    const primitive: string | null = parseSearch(raw).get(this.#primitiveWrapper);
    if (primitive === null) {
      return writeError(cx, {check: CheckKind.BaseType, expected: ["Ucs2String", "UsvString"]})
    } else {
      return this.#valueReader.readAny(cx, primitive, visitor);
    }
  }

  readBoolean<T>(cx: KryoContext, raw: string, visitor: ReadVisitor<T>): Result<T, CheckId> {
    const primitive: string | null = parseSearch(raw).get(this.#primitiveWrapper);
    if (primitive === null) {
      return writeError(cx, {check: CheckKind.BaseType, expected: ["Ucs2String", "UsvString"]})
    } else {
      return this.#valueReader.readBoolean(cx, primitive, visitor);
    }
  }

  readBytes<T>(cx: KryoContext, raw: string, visitor: ReadVisitor<T>): Result<T, CheckId> {
    const primitive: string | null = parseSearch(raw).get(this.#primitiveWrapper);
    if (primitive === null) {
      return writeError(cx, {check: CheckKind.BaseType, expected: ["Ucs2String", "UsvString"]})
    } else {
      return this.#valueReader.readBytes(cx, primitive, visitor);
    }
  }

  readDate<T>(cx: KryoContext, raw: string, visitor: ReadVisitor<T>): Result<T, CheckId> {
    const primitive: string | null = parseSearch(raw).get(this.#primitiveWrapper);
    if (primitive === null) {
      return writeError(cx, {check: CheckKind.BaseType, expected: ["Ucs2String", "UsvString"]})
    } else {
      return this.#valueReader.readDate(cx, primitive, visitor);
    }
  }

  readRecord<T>(cx: KryoContext, raw: string, visitor: ReadVisitor<T>): Result<T, CheckId> {
    const sp = parseSearch(raw);
    return this.#rootReader.readRecord(cx, sp, visitor);
  }

  readFloat64<T>(cx: KryoContext, raw: string, visitor: ReadVisitor<T>): Result<T, CheckId> {
    const primitive: string | null = parseSearch(raw).get(this.#primitiveWrapper);
    if (primitive === null) {
      return writeError(cx, {check: CheckKind.BaseType, expected: ["Ucs2String", "UsvString"]})
    } else {
      return this.#valueReader.readFloat64(cx, primitive, visitor);
    }
  }

  readList<T>(cx: KryoContext, raw: string, visitor: ReadVisitor<T>): Result<T, CheckId> {
    const primitive: string | null = parseSearch(raw).get(this.#primitiveWrapper);
    if (primitive === null) {
      return writeError(cx, {check: CheckKind.BaseType, expected: ["Ucs2String", "UsvString"]})
    } else {
      return this.#valueReader.readList(cx, primitive, visitor);
    }
  }

  readMap<T>(cx: KryoContext, raw: string, visitor: ReadVisitor<T>): Result<T, CheckId> {
    return this.#rootReader.readMap(cx, parseSearch(raw), visitor);
  }

  readNull<T>(cx: KryoContext, raw: string, visitor: ReadVisitor<T>): Result<T, CheckId> {
    const primitive: string | null = parseSearch(raw).get(this.#primitiveWrapper);
    if (primitive === null) {
      return writeError(cx, {check: CheckKind.BaseType, expected: ["Ucs2String", "UsvString"]})
    } else {
      return this.#valueReader.readNull(cx, primitive, visitor);
    }
  }

  readString<T>(cx: KryoContext, raw: string, visitor: ReadVisitor<T>): Result<T, CheckId> {
    const primitive: string | null = parseSearch(raw).get(this.#primitiveWrapper);
    if (primitive === null) {
      return writeError(cx, {check: CheckKind.BaseType, expected: ["Ucs2String", "UsvString"]})
    } else {
      return this.#valueReader.readString(cx, primitive, visitor);
    }
  }
}

export const SEARCH_PARAMS_READER: SearchParamsReader = new SearchParamsReader();
