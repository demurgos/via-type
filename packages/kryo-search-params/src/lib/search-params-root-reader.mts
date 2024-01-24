import {CheckId, KryoContext, Reader, ReadVisitor, Result, writeError} from "kryo";
import {BaseTypeCheck} from "kryo/checks/base-type";
import {CheckKind} from "kryo/checks/check-kind";
import {PropertyKeyCheck} from "kryo/checks/property-key";
import {SEARCH_PARAMS_VALUE_READER} from "./search-params-value-reader.mjs";
import {JSON_VALUE_READER} from "kryo-json/json-value-reader";
import {$Any} from "kryo/any";

export class SearchParamsRootReader implements Reader<URLSearchParams> {
  trustInput?: boolean | undefined;

  constructor(trust?: boolean) {
    this.trustInput = trust;
  }

  readAny<T>(cx: KryoContext, input: URLSearchParams, visitor: ReadVisitor<T>): Result<T, CheckId> {
    const inputMap: Map<string, string> = new Map();
    for (const [key, rawValue] of input.entries()) {
      const {ok, value} = $Any.read(cx, SEARCH_PARAMS_VALUE_READER, rawValue);
      if (ok) {
        inputMap.set(key, value);
      } else {
        return {ok: false, value};
      }
    }
    return visitor.fromMap(inputMap, SEARCH_PARAMS_VALUE_READER, JSON_VALUE_READER);
  }

  readBoolean<T>(cx: KryoContext, _input: URLSearchParams, _visitor: ReadVisitor<T>): Result<T, CheckId> {
    return writeError(cx, {check: CheckKind.BaseType, expected: ["Record"]} satisfies BaseTypeCheck);
  }

  readBytes<T>(cx: KryoContext, _input: URLSearchParams, _visitor: ReadVisitor<T>): Result<T, CheckId> {
    return writeError(cx, {check: CheckKind.BaseType, expected: ["Record"]} satisfies BaseTypeCheck);
  }

  readDate<T>(cx: KryoContext, _input: URLSearchParams, _visitor: ReadVisitor<T>): Result<T, CheckId> {
    return writeError(cx, {check: CheckKind.BaseType, expected: ["Record"]} satisfies BaseTypeCheck);
  }

  readRecord<T>(cx: KryoContext, input: URLSearchParams, visitor: ReadVisitor<T>): Result<T, CheckId> {
    if (typeof input !== "object" || input === null) {
      return writeError(cx, {check: CheckKind.BaseType, expected: ["Record"]} satisfies BaseTypeCheck);
    }
    const inputMap: Map<string, string> = new Map(input.entries());
    return visitor.fromMap(inputMap, JSON_VALUE_READER, SEARCH_PARAMS_VALUE_READER);
  }

  readFloat64<T>(cx: KryoContext, _input: URLSearchParams, _visitor: ReadVisitor<T>): Result<T, CheckId> {
    return writeError(cx, {check: CheckKind.BaseType, expected: ["Record"]} satisfies BaseTypeCheck);
  }

  readList<T>(cx: KryoContext, _input: URLSearchParams, _visitor: ReadVisitor<T>): Result<T, CheckId> {
    return writeError(cx, {check: CheckKind.BaseType, expected: ["Record"]} satisfies BaseTypeCheck);
  }

  readMap<T>(cx: KryoContext, input: URLSearchParams, visitor: ReadVisitor<T>): Result<T, CheckId> {
    if (typeof input !== "object" || input === null) {
      return writeError(cx, {check: CheckKind.BaseType, expected: ["Record"]} satisfies BaseTypeCheck);
    }
    const inputMap: Map<unknown, string> = new Map();
    for (const [rawKey, rawValue] of input.entries()) {
      let key: unknown;
      try {
        key = JSON.parse(rawKey);
        // key = (/* keyType */ undefined as any).read(jsonReader, key);
      } catch (err) {
        if (!(err instanceof Error)) {
          throw err;
        }
        return writeError(cx, {check: CheckKind.PropertyKey} satisfies PropertyKeyCheck);
      }
      inputMap.set(key, rawValue);
    }
    return visitor.fromMap(inputMap, JSON_VALUE_READER, SEARCH_PARAMS_VALUE_READER);
  }

  readNull<T>(cx: KryoContext, _input: URLSearchParams, _visitor: ReadVisitor<T>): Result<T, CheckId> {
    return writeError(cx, {check: CheckKind.BaseType, expected: ["Record"]} satisfies BaseTypeCheck);
  }

  readString<T>(cx: KryoContext, _input: URLSearchParams, _visitor: ReadVisitor<T>): Result<T, CheckId> {
    return writeError(cx, {check: CheckKind.BaseType, expected: ["Record"]} satisfies BaseTypeCheck);
  }
}

export const SEARCH_PARAMS_ROOT_READER: SearchParamsRootReader = new SearchParamsRootReader();
