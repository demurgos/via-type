import { assert as chaiAssert } from "chai";

import {NOOP_CONTEXT, Type} from "../../lib/index.mjs";

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
  it("Should return `ResultErr` for .test", function () {
    chaiAssert.isFalse(type.test(NOOP_CONTEXT, item.value).ok);
  });
}

export function testValidValue(type: Type<any>, item: ValidTypedValue) {
  it("Should return `ResultOk` for .test", function () {
    chaiAssert.isTrue(type.test(NOOP_CONTEXT, item.value).ok);
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
