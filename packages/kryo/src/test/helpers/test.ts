import chai from "chai";

import { Type } from "../../lib";

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

export function testInvalidValue(type: Type<any>, item: InvalidTypedValue) {
  if (type.testError !== undefined) {
    it("Should return an Error for .testError", function () {
      chai.assert.instanceOf(type.testError!(item.value), Error);
    });
  }

  it("Should return `false` for .test", function () {
    chai.assert.isFalse(type.test(item.value));
  });
}

export function testValidValue(type: Type<any>, item: ValidTypedValue) {
  if (type.testError !== undefined) {
    it("Should return `undefined` for .testError", function () {
      if (type.testError === undefined) {
        console.log("undef");
      }
      const error: Error | undefined = type.testError!(item.value);
      if (error !== undefined) {
        chai.assert.fail(error, undefined, String(error));
      }
    });
  }

  it("Should return `true` for .test", function () {
    chai.assert.isTrue(type.test(item.value));
  });
}

export function testValueSync(type: Type<any>, item: TypedValue): void {
  if (item.valid) {
    testValidValue(type, item);
  } else {
    testInvalidValue(type, item);
  }
}

export function runTests(type: Type<any>, items: TypedValue[]): void {
  for (const item of items) {
    describe(`Item: ${getName(item)}`, function () {
      testValueSync(type, item);
    });
  }
}
