import { assert as chaiAssert } from "chai";
import {IoType, NOOP_CONTEXT,Reader, readOrThrow, Writer} from "kryo";
import util from "util";

export interface TestItem<T = unknown> {
  name?: string;
  value: T;
  io?: IoTestItem[];
}

export interface WriteTestItem<Raw = unknown> {
  writer: Writer<Raw>;
  reader?: Reader<Raw>;
  raw: Raw;
}

export interface ReadWriteTestItem<Raw = unknown> {
  writer: Writer<Raw>;
  reader: Reader<Raw>;
  raw: Raw;
}

export interface ReadTestItem<Raw = unknown> {
  writer?: Writer<Raw>;
  reader: Reader<Raw>;
  raw: Raw;
}

export type IoTestItem<Raw = unknown> = WriteTestItem<Raw> | ReadWriteTestItem<Raw> | ReadTestItem<Raw>;

export function registerErrMochaTests<T = unknown>(
  reader: Reader<unknown>,
  ioType: IoType<T>,
  raws: Iterable<unknown>,
): void {
  for (const raw of raws) {
    it(`rejects: ${util.inspect(raw)}`, function () {
      try {
        const actualValue: T = readOrThrow(ioType, reader, raw);
        chaiAssert.fail(`expected reader to throw, value: ${util.inspect(actualValue)}`);
      } catch (err) {
        chaiAssert.isDefined(err);
      }
    });
  }
}

export function registerMochaSuites<T = unknown>(
  ioType: IoType<T>,
  testItems: Iterable<TestItem<T>>,
): void {
  for (const testItem of testItems) {
    registerMochaSuite(ioType, testItem);
  }
}

export function registerMochaSuite<T = unknown>(ioType: IoType<T>, testItem: TestItem<T>): void {
  const name: string = getName(testItem);
  describe(name, function () {
    registerMochaTests(ioType, testItem);
  });
}

export function registerMochaTests<T = unknown>(ioType: IoType<T>, testItem: TestItem<T>): void {
  if (testItem.io === undefined) {
    return;
  }
  for (const ioTest of testItem.io) {
    if (ioTest.writer !== undefined) {
      registerMochaWriteTest(`write: ${util.inspect(ioTest.raw)}`, ioType, testItem.value, ioTest as any);
    }
    if (ioTest.reader !== undefined) {
      registerMochaReadTest(`read: ${util.inspect(ioTest.raw)}`, ioType, testItem.value, ioTest as any);
    }
  }
}

export function registerMochaWriteTest<T = unknown>(
  testName: string,
  ioType: IoType<T>,
  inputValue: T,
  testItem: WriteTestItem,
): void {
  it(testName, function () {
    const actualRaw: typeof testItem.raw = ioType.write(testItem.writer, inputValue);
    chaiAssert.deepEqual(actualRaw, testItem.raw);
  });
}

export function registerMochaReadTest<T = unknown>(
  testName: string,
  ioType: IoType<T>,
  expectedValue: T,
  testItem: ReadTestItem,
): void {
  it(testName, function () {
    const actualValue: T = readOrThrow(ioType, testItem.reader, testItem.raw);
    chaiAssert.isTrue(ioType.test(NOOP_CONTEXT, actualValue).ok);
    chaiAssert.isTrue(ioType.equals(actualValue, expectedValue));
  });
}

function getName({name, value}: TestItem) {
  return name ?? util.inspect(value);
}
