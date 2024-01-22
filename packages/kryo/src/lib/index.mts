/**
 * This module defines most of the Typescript interfaces and type aliases used by Kryo.
 *
 * @module kryo/core
 */

import {Check, format} from "./checks/index.mjs";
import {AnyKey} from "./ts-enum.mjs";

export {writeError} from "./_helpers/write-error.mjs";
export {Check, format as formatCheck};

/**
 * Represents a lazy value of type `T`.
 * You can retrieve it with `const val = typeof lazy === "function" ? lazy() : lazy;`.
 * This library guarantees that it will be only called once but you should still ensure that it is idempotent.
 */
export type Lazy<T> = T | (() => T);

export interface ResultOk<T> {
  ok: true,
  value: T,
}

export interface ResultErr<E> {
  ok: false,
  value: E,
}

export type Result<T, E> = ResultOk<T> | ResultErr<E>;

export interface TypedValue<T, $T extends Type<T>> {
  value: T;
  type: $T;
}


export type CheckId = number;

export interface KryoContext {
  /**
   * Report a new diagnostic
   *
   * @param diagnostic Diagnostic to report for the current value.
   * @return Diagnoctic id for this context. This can be used to reference error chains.
   */
  write(diagnostic: Check): CheckId;

  /**
   * Run a function with a child context
   *
   * @param key Collection key to enter
   * @param cb Callback to execute in the child context
   */
  enter<R>(key: AnyKey, cb: () => R): R;
}

export const NOOP_CONTEXT: KryoContext = {
  write(): number {
    return 0;
  },
  enter<R>(_key: string | number, cb: () => R): R {
    return cb();
  },
};

export class ReporterContext {
  #path: AnyKey[];
  #checks: { path: AnyKey[], check: Check }[];

  constructor() {
    this.#path = [];
    this.#checks = [];
  }

  write(check: Check): CheckId {
    const id: CheckId = this.#checks.length;
    this.#checks.push({path: [...this.#path], check});
    return id;
  }

  enter<R>(key: string | number, cb: () => R): R {
    const oldLen = this.#path.length;
    this.#path.push(key);
    try {
      return cb();
    } finally {
      this.#path.length = oldLen;
    }
  }

  /**
   * Close the context and throw an error
   */
  throw(id: CheckId): never {
    throw new Error(this.report(id) ?? "(empty `kryo` report)");
  }

  /**
   * Close the context and report it as a string
   */
  report(id: CheckId): string | null {
    const lines: string[] = [];
    const written: Set<CheckId> = new Set();
    const pending: CheckId[] = [id];
    while (pending.length > 0) {
      const cur: CheckId = pending.pop()!;
      if (written.has(cur)) {
        continue;
      }
      if ((cur | 0) === cur && cur >= 0 && cur < this.#checks.length) {
        const {path, check} = this.#checks[cur];
        const pathStr = path.map((k: AnyKey): string => {
          if (typeof k === "string" || typeof k === "number") {
            return String(k);
          } else {
            return `Symbol(${String(k)})`;
          }
        }).join(".");
        const msg = format(check);
        lines.push(`${pathStr}#${cur}: ${msg}`);
        for (const child of (check.children ?? [])) {
          pending.push(child);
        }
      }
    }
    if (lines.length === 0) {
      return null;
    } else {
      return lines.join("\n");
    }
  }
}

/**
 * Simple type interface.
 *
 * This is the smallest interface for objects to be valid types.
 * A type with this interface can check the validity and equality of values, and clone them.
 */
export interface Type<T> {
  /**
   * Name of this type. This is only used to help with debugging.
   */
  name?: string;

  /**
   * Tests if this type matches `value`.
   *
   * @param cx Test context to collect diagnostics.
   * @param value The value to test against this type.
   * @return Boolean indicating if this type matches `value`.
   */
  test(cx: KryoContext | null, value: unknown): Result<T, CheckId>;

  /**
   * Tests if `left` is equal to `value`.
   *
   * This is a deep strict structural equality test restricted to the properties of this type.
   *
   * It satisfies the following properties (the variables `a`, `b` and `c` are valid values):
   * - Reflexivity: `type.equal(a, a) === true`
   * - Symmetry: `type.equals(a, b) === type.equals(b, a)`
   * - Transitivity: if `type.equals(a, b) && type.equals(b, c)` then `type.equals(a, c)`
   *
   * The above properties mean that type objects implement the `Setoid` algebra as specified by
   * Static Land.
   *
   * @see https://github.com/rpominov/static-land/blob/master/docs/spec.md#setoid
   * @param left Left value, trusted to be compatible with this type.
   * @param right Right value, trusted to be compatible with this type.
   * @return Boolean indicating if both values are equal.
   */
  equals(left: T, right: T): boolean;

  /**
   * Returns a deep copy of `value`.
   *
   * @param value The value to clone, trusted to be compatible with this type.
   * @return A deep copy of the supplied value, restricted to the properties of this type.
   */
  clone(value: T): T;

  /**
   * Compares two valid values.
   *
   * @param left Left operand, a valid value.
   * @param right Right operand, a valid value.
   * @return Boolean indicating if `left <= right` is true.
   */
  lte?(left: T, right: T): boolean;

  /**
   * Serializes the valid value `value`.
   *
   * @param writer Writer used to emit the data.
   * @param value Value to serialize.
   * @return Writer result.
   */
  write?<W>(writer: Writer<W>, value: T): W;

  /**
   * Deserializes a value of this type.
   *
   * @param cx Read context, to collect diagnostics.
   * @param reader Reader to drive during the deserialization.
   * @param raw Reader input.
   * @return Valid value.
   */
  read?<R>(cx: KryoContext, reader: Reader<R>, raw: R): Result<T, CheckId>;
}

export interface Ord<T> {
  lte(left: T, right: T): boolean;
}

export interface Writable<T> {
  write<W>(writer: Writer<W>, value: T): W;
}

export interface Readable<T> {
  read<R>(cx: KryoContext, reader: Reader<R>, raw: R): Result<T, CheckId>;
}

/**
 * Represents a type suitable for IO operations: this type supports both serialization and
 * deserialization.
 */
export interface IoType<T> extends Type<T>, Readable<T>, Writable<T> {
  write<W>(writer: Writer<W>, value: T): W;

  read<R>(cx: KryoContext, reader: Reader<R>, raw: R): Result<T, CheckId>;
}

/**
 * W: Write result type.
 */
export interface Writer<W> {
  writeAny(value: any): W;

  writeBoolean(value: boolean): W;

  writeBytes(value: Uint8Array): W;

  writeDate(value: Date): W;

  writeRecord<K extends string>(keys: Iterable<K>, handler: <FW>(key: K, fieldWriter: Writer<FW>) => FW): W;

  writeFloat64(value: number): W;

  writeList(size: number, handler: <IW>(index: number, itemWriter: Writer<IW>) => IW): W;

  writeMap(
    size: number,
    keyHandler: <KW>(index: number, mapKeyWriter: Writer<KW>) => KW,
    valueHandler: <VW>(index: number, mapValueWriter: Writer<VW>) => VW,
  ): W;

  writeNull(): W;

  writeString(value: string): W;
}

/**
 * T: Return type of the read-visitor. This is the type of the value you actually want to create.
 */
export interface ReadVisitor<T> {
  fromBoolean(input: boolean): Result<T, CheckId>;

  fromBytes(input: Uint8Array): Result<T, CheckId>;

  fromDate(input: Date): Result<T, CheckId>;

  fromFloat64(input: number): Result<T, CheckId>;

  fromList<RI>(input: Iterable<RI>, itemReader: Reader<RI>): Result<T, CheckId>;

  fromMap<RK, RV>(input: Map<RK, RV>, keyReader: Reader<RK>, valueReader: Reader<RV>): Result<T, CheckId>;

  fromNull(): Result<T, CheckId>;

  fromString(input: string): Result<T, CheckId>;
}

/**
 * R: Raw input type.
 */
export interface Reader<R> {
  /**
   * Boolean indicating that this reader wishes to opt-out of unneeded data validity checks.
   */
  trustInput?: boolean;

  readAny<T>(cx: KryoContext, raw: R, visitor: ReadVisitor<T>): Result<T, CheckId>;

  readBoolean<T>(cx: KryoContext, raw: R, visitor: ReadVisitor<T>): Result<T, CheckId>;

  readBytes<T>(cx: KryoContext, raw: R, visitor: ReadVisitor<T>): Result<T, CheckId>;

  readDate<T>(cx: KryoContext, raw: R, visitor: ReadVisitor<T>): Result<T, CheckId>;

  readRecord<T>(cx: KryoContext, raw: R, visitor: ReadVisitor<T>): Result<T, CheckId>;

  readFloat64<T>(cx: KryoContext, raw: R, visitor: ReadVisitor<T>): Result<T, CheckId>;

  readList<T>(cx: KryoContext, raw: R, visitor: ReadVisitor<T>): Result<T, CheckId>;

  readMap<T>(cx: KryoContext, raw: R, visitor: ReadVisitor<T>): Result<T, CheckId>;

  readNull<T>(cx: KryoContext, raw: R, visitor: ReadVisitor<T>): Result<T, CheckId>;

  readString<T>(cx: KryoContext, raw: R, visitor: ReadVisitor<T>): Result<T, CheckId>;
}

export interface VersionedType<T, Diff> extends Type<T> {
  /**
   * Returns undefined if both values are equivalent, otherwise a diff representing the change from
   * oldVal to newVal.
   *
   * @param oldVal The old value
   * @param newVal The new value
   */
  diff(oldVal: T, newVal: T): Diff | undefined;

  patch(oldVal: T, diff: Diff | undefined): T;

  reverseDiff(diff: Diff | undefined): Diff | undefined;

  squash(oldDiff: Diff | undefined, newDiff: Diff | undefined): Diff | undefined;

  // readonly diffType: Type<Diff>;
}

/**
 * Represents an identifier case style.
 *
 * This enum is used when automatically renaming fields and enum variants.
 */
export enum CaseStyle {
  /**
   * Capitalize every component except for the first one, then join them without any separator.
   *
   * e.g. `camelCase`
   */
  CamelCase = "camelCase",

  /**
   * Capitalize every component, then join them without any separator.
   *
   * e.g. `PascalCase`
   */
  PascalCase = "PascalCase",

  /**
   * Make every component lowerCase, then join them using `_`.
   *
   * e.g. `snake_case`
   */
  SnakeCase = "snake_case",

  /**
   * Make every component uppercase, then join them using `_`.
   *
   * e.g. `SCREAMING_SNAKE_CASE`
   */
  ScreamingSnakeCase = "SCREAMING_SNAKE_CASE",

  /**
   * Make every component lowerCase, then join them using `-`.
   *
   * e.g. `kebab-case`
   */
  KebabCase = "kebab-case",
}

export function testOrThrow<T>(type: Type<T>, raw: unknown): asserts raw is T {
  const {ok} = type.test(null, raw);
  if (!ok) {
    throw new Error("invalid type");
  }
}

export function readOrThrow<T, R>(type: IoType<T>, reader: Reader<R>, raw: R): T {
  const cx = new ReporterContext();
  const {ok, value} = type.read(cx, reader, raw);
  if (ok) {
    return value;
  } else {
    return cx.throw(value);
  }
}
