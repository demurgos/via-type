import chai from "chai";
import { IoType, Reader, Writer } from "kryo";
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
        const actualValue: T = ioType.read(reader, raw);
        chai.assert.fail(`expected reader to throw, value: ${util.inspect(actualValue)}`);
      } catch (err) {
        chai.assert.isDefined(err);
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
    chai.assert.deepEqual(actualRaw, testItem.raw);
  });
}

export function registerMochaReadTest<T = unknown>(
  testName: string,
  ioType: IoType<T>,
  expectedValue: T,
  testItem: ReadTestItem,
): void {
  it(testName, function () {
    const actualValue: T = ioType.read(testItem.reader, testItem.raw);
    chai.assert.isTrue(ioType.test(actualValue));
    chai.assert.isTrue(ioType.equals(actualValue, expectedValue));
  });
}

function getName({name, value}: TestItem) {
  return name ?? util.inspect(value);
}
