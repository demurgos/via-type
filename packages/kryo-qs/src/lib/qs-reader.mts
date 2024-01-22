/**
 * @module kryo/readers/qs
 */

import {CheckId, KryoContext, Reader, ReadVisitor, Result} from "kryo";
import qs from "qs";

import {QsValueReader} from "./qs-value-reader.mjs";

export class QsReader implements Reader<string> {
  trustInput?: boolean | undefined;

  private readonly valueReader: QsValueReader;

  private readonly primitiveWrapper: string;

  constructor(trust?: boolean, primitiveWrapper: string = "_") {
    this.trustInput = trust;
    this.primitiveWrapper = primitiveWrapper;
    this.valueReader = new QsValueReader(trust);
  }

  readAny<T>(cx: KryoContext, raw: string, visitor: ReadVisitor<T>): Result<T, CheckId> {
    return this.valueReader.readAny(cx, qs.parse(raw)[this.primitiveWrapper], visitor);
  }

  readBoolean<T>(cx: KryoContext, raw: string, visitor: ReadVisitor<T>): Result<T, CheckId> {
    return this.valueReader.readBoolean(cx, qs.parse(raw)[this.primitiveWrapper], visitor);
  }

  readBytes<T>(cx: KryoContext, raw: string, visitor: ReadVisitor<T>): Result<T, CheckId> {
    return this.valueReader.readBytes(cx, qs.parse(raw)[this.primitiveWrapper], visitor);
  }

  readDate<T>(cx: KryoContext, raw: string, visitor: ReadVisitor<T>): Result<T, CheckId> {
    return this.valueReader.readDate(cx, qs.parse(raw)[this.primitiveWrapper], visitor);
  }

  readRecord<T>(cx: KryoContext, raw: any, visitor: ReadVisitor<T>): Result<T, CheckId> {
    return this.valueReader.readRecord(cx, qs.parse(raw), visitor);
  }

  readFloat64<T>(cx: KryoContext, raw: string, visitor: ReadVisitor<T>): Result<T, CheckId> {
    return this.valueReader.readFloat64(cx, qs.parse(raw)[this.primitiveWrapper], visitor);
  }

  readList<T>(cx: KryoContext, raw: any, visitor: ReadVisitor<T>): Result<T, CheckId> {
    return this.valueReader.readList(cx, qs.parse(raw)[this.primitiveWrapper], visitor);
  }

  readMap<T>(cx: KryoContext, raw: any, visitor: ReadVisitor<T>): Result<T, CheckId> {
    return this.valueReader.readMap(cx, qs.parse(raw), visitor);
  }

  readNull<T>(cx: KryoContext, raw: string, visitor: ReadVisitor<T>): Result<T, CheckId> {
    return this.valueReader.readNull(cx, qs.parse(raw)[this.primitiveWrapper], visitor);
  }

  readString<T>(cx: KryoContext, raw: string, visitor: ReadVisitor<T>): Result<T, CheckId> {
    return this.valueReader.readString(cx, qs.parse(raw)[this.primitiveWrapper], visitor);
  }
}

export const QS_READER: QsReader = new QsReader();
