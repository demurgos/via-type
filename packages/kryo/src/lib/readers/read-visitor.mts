/**
 * @module kryo/readers/read-visitor
 */

import { ReadVisitor } from "../index.mjs";

function fromBoolean(_: boolean): never {
  throw new Error("Unable to read from boolean");
}

function fromBytes(_: Uint8Array): never {
  throw new Error("Unable to read from bytes");
}

function fromDate(_: Date): never {
  throw new Error("Unable to read from date");
}

function fromFloat64(_: number): never {
  throw new Error("Unable to read from float64");
}

function fromList(_: Iterable<any>): never {
  throw new Error("Unable to read from list");
}

function fromMap(_: Map<any, any>): never {
  throw new Error("Unable to read from map");
}

function fromNull(): never {
  throw new Error("Unable to read from null");
}

function fromString(_: string): never {
  throw new Error("Unable to read from string");
}

export function readVisitor<R>(partial: Partial<ReadVisitor<R>>): ReadVisitor<R> {
  return {
    fromBytes,
    fromBoolean,
    fromDate,
    fromFloat64,
    fromMap,
    fromNull,
    fromList,
    fromString,
    ...partial,
  };
}
