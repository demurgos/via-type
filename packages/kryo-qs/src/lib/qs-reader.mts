/**
 * @module kryo/readers/qs
 */

import { Reader, ReadVisitor } from "kryo";
import qs from "qs";

import { QsValueReader } from "./qs-value-reader.mjs";

export class QsReader implements Reader<string> {
  trustInput?: boolean | undefined;

  private readonly valueReader: QsValueReader;

  private readonly primitiveWrapper: string;

  constructor(trust?: boolean, primitiveWrapper: string = "_") {
    this.trustInput = trust;
    this.primitiveWrapper = primitiveWrapper;
    this.valueReader = new QsValueReader(trust);
  }

  readAny<R>(raw: string, visitor: ReadVisitor<R>): R {
    return this.valueReader.readAny(qs.parse(raw)[this.primitiveWrapper], visitor);
  }

  readBoolean<R>(raw: string, visitor: ReadVisitor<R>): R {
    return this.valueReader.readBoolean(qs.parse(raw)[this.primitiveWrapper], visitor);
  }

  readBytes<R>(raw: string, visitor: ReadVisitor<R>): R {
    return this.valueReader.readBytes(qs.parse(raw)[this.primitiveWrapper], visitor);
  }

  readDate<R>(raw: string, visitor: ReadVisitor<R>): R {
    return this.valueReader.readDate(qs.parse(raw)[this.primitiveWrapper], visitor);
  }

  readRecord<R>(raw: any, visitor: ReadVisitor<R>): R {
    return this.valueReader.readRecord(qs.parse(raw), visitor);
  }

  readFloat64<R>(raw: string, visitor: ReadVisitor<R>): R {
    return this.valueReader.readFloat64(qs.parse(raw)[this.primitiveWrapper], visitor);
  }

  readList<R>(raw: any, visitor: ReadVisitor<R>): R {
    return this.valueReader.readList(qs.parse(raw)[this.primitiveWrapper], visitor);
  }

  readMap<R>(raw: any, visitor: ReadVisitor<R>): R {
    return this.valueReader.readMap(qs.parse(raw), visitor);
  }

  readNull<R>(raw: string, visitor: ReadVisitor<R>): R {
    return this.valueReader.readNull(qs.parse(raw)[this.primitiveWrapper], visitor);
  }

  readString<R>(raw: string, visitor: ReadVisitor<R>): R {
    return this.valueReader.readString(qs.parse(raw)[this.primitiveWrapper], visitor);
  }
}

export const QS_READER: QsReader = new QsReader();
