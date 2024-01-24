import {CheckId, KryoContext, Reader, ReadVisitor, Result, writeError} from "kryo";
import {BaseTypeCheck} from "kryo/checks/base-type";
import {CheckKind} from "kryo/checks/check-kind";
import {JSON_READER, JsonReader} from "kryo-json/json-reader";

export class SearchParamsValueReader implements Reader<string> {
  trustInput?: boolean | undefined;

  constructor(trust?: boolean) {
    this.trustInput = trust;
  }

  readAny<T>(cx: KryoContext, input: string, visitor: ReadVisitor<T>): Result<T, CheckId> {
    return JSON_READER.readAny(cx, input, visitor);
  }

  readBoolean<T>(cx: KryoContext, input: string, visitor: ReadVisitor<T>): Result<T, CheckId> {
    if (input !== "true" && input !== "false") {
      return writeError(cx, {check: CheckKind.BaseType, expected: ["Boolean"]} satisfies BaseTypeCheck);
    }
    return visitor.fromBoolean(input === "true");
  }

  readBytes<T>(cx: KryoContext, input: string, visitor: ReadVisitor<T>): Result<T, CheckId> {
    if (typeof input !== "string") {
      return writeError(cx, {check: CheckKind.BaseType, expected: ["Ucs2String", "UsvString", "Bytes"]} satisfies BaseTypeCheck);
    } else if (!/^(?:[0-9a-f]{2})*$/.test(input)) {
      return writeError(cx, {check: CheckKind.BaseType, expected: ["Ucs2String", "UsvString", "Bytes"]} satisfies BaseTypeCheck);
    }
    const len: number = input.length / 2;
    const result: Uint8Array = new Uint8Array(len);
    for (let i: number = 0; i < len; i++) {
      result[i] = parseInt(input.substring(2 * i, 2 * i + 2), 16);
    }
    return visitor.fromBytes(result);
  }

  readDate<T>(cx: KryoContext, input: string, visitor: ReadVisitor<T>): Result<T, CheckId> {
    if (this.trustInput) {
      return visitor.fromDate(new Date(input as number | string));
    }

    if (typeof input === "string") {
      return visitor.fromDate(new Date(input));
    }

    return writeError(cx, {check: CheckKind.BaseType, expected: ["Ucs2String", "Float64", "Sint53", "UsvString"]} satisfies BaseTypeCheck);
  }

  readRecord<T>(cx: KryoContext, input: string, visitor: ReadVisitor<T>): Result<T, CheckId> {
    const jsonReader: JsonReader = new JsonReader();
    return jsonReader.readRecord(cx, input, visitor);
  }

  readFloat64<T>(cx: KryoContext, input: string, visitor: ReadVisitor<T>): Result<T, CheckId> {
    const specialValues: Map<unknown, number> = new Map([
      ["-0", -0],
      ["NaN", NaN],
      ["Infinity", Infinity],
      ["+Infinity", Infinity],
      ["-Infinity", -Infinity],
    ]);
    const special: number | undefined = specialValues.get(input);
    if (special !== undefined) {
      return visitor.fromFloat64(special);
    } else if (typeof input === "string") {
      return visitor.fromFloat64(parseFloat(input));
    } else {
      return writeError(cx, {check: CheckKind.BaseType, expected: ["Float64"]} satisfies BaseTypeCheck);
    }
  }

  readList<T>(cx: KryoContext, input: string, visitor: ReadVisitor<T>): Result<T, CheckId> {
    return JSON_READER.readList(cx, input, visitor);
  }

  readMap<T>(cx: KryoContext, input: string, visitor: ReadVisitor<T>): Result<T, CheckId> {
    return JSON_READER.readMap(cx, input, visitor);
  }

  readNull<T>(cx: KryoContext, input: string, visitor: ReadVisitor<T>): Result<T, CheckId> {
    if (this.trustInput) {
      return visitor.fromNull();
    }
    if (input !== "") {
      return writeError(cx, {check: CheckKind.BaseType, expected: ["Ucs2String", "UsvString"]} satisfies BaseTypeCheck);
    }
    return visitor.fromNull();
  }

  readString<T>(cx: KryoContext, input: string, visitor: ReadVisitor<T>): Result<T, CheckId> {
    if (typeof input !== "string") {
      return writeError(cx, {check: CheckKind.BaseType, expected: ["Ucs2String", "UsvString"]} satisfies BaseTypeCheck);
    }
    return visitor.fromString(input);
  }
}

export const SEARCH_PARAMS_VALUE_READER: SearchParamsValueReader = new SearchParamsValueReader();
