import {BSON} from "bson";
import {assert} from "chai";
import * as qs from "qs";
import {SerializableType, Type} from "../../lib/interfaces";

export interface NamedValue {
  name?: string;
  value: any;
}

export interface CheckedValue extends NamedValue {
  valid: boolean;
}

export interface InvalidTypedValue extends CheckedValue {
  valid: boolean;
  testError?: Error;
}

export interface ValidTypedValue extends CheckedValue {
  valid: boolean;

  output?: {
    [formatName: string]: any;
  };

  inputs?: {
    [formatName: string]: any;
  };

  invalidInputs?: {
    [formatName: string]: any;
  };
}

export type TypedValue = InvalidTypedValue | ValidTypedValue;

function getName(namedValue: NamedValue) {
  return "name" in namedValue ? namedValue.name : JSON.stringify(namedValue.value);
}

export function testInvalidValueSync(type: Type<any>, item: InvalidTypedValue) {
  it("Should return an Error for .testErrorSync", function () {
    assert.instanceOf(type.testError(item.value), Error);
  });

  it("Should return `false` for .testSync", function () {
    assert.isFalse(type.test(item.value));
  });
}

export function testValidValueSync(type: Type<any>, item: ValidTypedValue) {
  it("Should return `undefined` for .testErrorSync", function () {
    const error: Error | undefined = type.testError(item.value);
    assert.isUndefined(error);
  });

  it("Should return `true` for .testSync", function () {
    assert.isTrue(type.test(item.value));
  });
}

export function testBsonSerialization<T, Output, Input extends Output>(
  type: SerializableType<T, "bson", Output, Input>,
  typedValue: ValidTypedValue
): void {
  let actualSerialized: Buffer;

  if (typedValue.output !== undefined && "bson" in typedValue.output) {
    const output: Output = typedValue.output["bson"];
    const expectedSerialized: Buffer = new BSON().serialize({wrapper: output});
    it(`\`.write(format: "bson", val)\` should return the expected value`, function () {
      const exported: Output = type.write("bson", typedValue.value);
      actualSerialized = new BSON().serialize({wrapper: exported});
      assert.deepEqual(actualSerialized, expectedSerialized);
    });
  } else {
    it(`\`t.write("bson", val)\` should not throw`, function () {
      const exported: Output = type.write("bson", typedValue.value);
      actualSerialized = new BSON().serialize({wrapper: exported});
    });
  }

  it(`\`t.readTrusted("bson", t.write("bson", val))\` should be valid and equal to \`val\``, function () {
    const deserialized: Output = new BSON().deserialize(actualSerialized).wrapper;
    const imported: T = type.readTrusted("bson", deserialized);
    assert.isTrue(type.test(imported));
    assert.isTrue(type.equals(imported, typedValue.value));
  });

  it(`\`t.read("bson", t.write("bson", val))\` should be valid and equal to \`val\``, function () {
    const deserialized: Output = new BSON().deserialize(actualSerialized).wrapper;
    const imported: T = type.read("bson", <Input> deserialized);
    assert.isTrue(type.test(imported));
    assert.isTrue(type.equals(imported, typedValue.value));
  });
}

export function testJsonSerialization<T, Output, Input extends Output>(
  type: SerializableType<T, "json", Output, Input>,
  typedValue: ValidTypedValue
): void {
  let actualSerialized: string;

  if (typedValue.output !== undefined && "json" in typedValue.output) {
    const output: Output = typedValue.output["json"];
    const expectedSerialized: string = JSON.stringify(output);
    it(`\`.write(format: "json", val)\` should return \`${expectedSerialized}\``, function () {
      const exported: Output = type.write("json", typedValue.value);
      actualSerialized = JSON.stringify(exported);
      assert.deepEqual(exported, output);
    });
  } else {
    it(`\`t.write("json", val)\` should not throw`, function () {
      const exported: Output = type.write("json", typedValue.value);
      actualSerialized = JSON.stringify(exported);
    });
  }

  it(`\`t.readTrusted("json", t.write("json", val))\` should be valid and equal to \`val\``, function () {
    const deserialized: Output = JSON.parse(actualSerialized);
    const imported: T = type.readTrusted("json", deserialized);
    assert.isTrue(type.test(imported));
    assert.isTrue(type.equals(imported, typedValue.value));
  });

  it(`\`t.read("json", t.write("json", val))\` should be valid and equal to \`val\``, function () {
    const deserialized: Output = JSON.parse(actualSerialized);
    const imported: T = type.read("json", <Input> deserialized);
    assert.isTrue(type.test(imported));
    assert.isTrue(type.equals(imported, typedValue.value));
  });
}

export function testQsSerialization<T, Output, Input extends Output>(
  type: SerializableType<T, "qs", Output, Input>,
  typedValue: ValidTypedValue
): void {
  let actualSerialized: string;

  if (typedValue.output !== undefined && "qs" in typedValue.output) {
    const output: Output = typedValue.output["qs"];
    const expectedSerialized: string = qs.stringify({wrapper: output});
    it(`\`.write(format: "qs", val)\` should return the wrapped value \`${expectedSerialized}\``, function () {
      const exported: Output = type.write("qs", typedValue.value);
      actualSerialized = qs.stringify({wrapper: exported});
      assert.deepEqual(exported, output);
    });
  } else {
    it(`\`t.write("qs", val)\` should not throw`, function () {
      const exported: Output = type.write("qs", typedValue.value);
      actualSerialized = qs.stringify({wrapper: exported});
    });
  }

  it(`\`t.readTrusted("qs", t.write("qs", val))\` should be valid and equal to \`val\``, function () {
    const deserialized: Output = qs.parse(actualSerialized).wrapper;
    const imported: T = type.readTrusted("qs", deserialized);
    assert.isTrue(type.test(imported));
    assert.isTrue(type.equals(imported, typedValue.value));
  });

  it(`\`t.read("qs", t.write("qs", val))\` should be valid and equal to \`val\``, function () {
    const deserialized: Output = qs.parse(actualSerialized).wrapper;
    const imported: T = type.read("qs", <Input> deserialized);
    assert.isTrue(type.test(imported));
    assert.isTrue(type.equals(imported, typedValue.value));
  });
}

export function testSerialization<T>(
  type: SerializableType<T, "bson", any, any>
    & SerializableType<T, "json", any, any>
    & SerializableType<T, "qs", any, any>,
  typedValue: ValidTypedValue
): void {
  testBsonSerialization(type, typedValue);
  testJsonSerialization(type, typedValue);
  testQsSerialization(type, typedValue);
}

export function testValueSync(type: SerializableType<any, any, any, any>, item: TypedValue): void;
export function testValueSync(type: any, item: any): any {
  if (item.valid) {
    testValidValueSync(type, item);
    testSerialization(type, item);
  } else {
    testInvalidValueSync(type, item);
  }
}

export function runTests(type: SerializableType<any, any, any, any>, items: TypedValue[]): void;
export function runTests(type: any, items: any): any {
  for (const item of items) {
    describe(`Item: ${getName(item)}`, function () {
      testValueSync(type, item);
    });
  }
}
