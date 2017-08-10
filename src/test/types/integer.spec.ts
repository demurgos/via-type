import {assert} from "chai";
import {$Sint8} from "../../lib/builtins/integer";
import {IntegerType} from "../../lib/types/integer";
import {runTests, TypedValue} from "../helpers/test";

describe("IntegerType", function () {
  describe("General", function () {
    const type: IntegerType = new IntegerType();

    const items: TypedValue[] = [
      // Valid values
      {name: "0", value: 0, valid: true},
      {name: "1", value: 1, valid: true},
      {name: "-1", value: -1, valid: true},
      {name: "2", value: 2, valid: true},
      {name: "1e3", value: 1e3, valid: true},
      {name: "-1e3", value: 1e3, valid: true},
      {name: "Number.MAX_SAFE_INTEGER", value: Number.MAX_SAFE_INTEGER, valid: true},
      {name: "Number.MAX_SAFE_INTEGER - 1", value: Number.MAX_SAFE_INTEGER - 1, valid: true},
      {name: "Number.MIN_SAFE_INTEGER", value: Number.MIN_SAFE_INTEGER, valid: true},
      {name: "Number.MIN_SAFE_INTEGER - 1", value: Number.MIN_SAFE_INTEGER - 1, valid: true},
      /* tslint:disable-next-line:restrict-plus-operands */
      {name: "Number.MIN_SAFE_INTEGER + 1", value: Number.MIN_SAFE_INTEGER + 1, valid: true},
      // Invalid values
      {name: "0.5", value: 0.5, valid: false},
      {name: "0.0001", value: 0.0001, valid: false},
      {name: "Number.EPSILON", value: Number.EPSILON, valid: false},
      /* tslint:disable-next-line:restrict-plus-operands */
      {name: "Number.MAX_SAFE_INTEGER + 1", value: Number.MAX_SAFE_INTEGER + 1, valid: false},
      {name: "Number.MIN_SAFE_INTEGER - 2", value: Number.MIN_SAFE_INTEGER - 2, valid: true},
      {name: "Number.MAX_VALUE", value: Number.MAX_VALUE, valid: false},
      {name: "new Number(true)", value: new Number(1), valid: false},
      {name: '""', value: "", valid: false},
      {name: '"0"', value: "0", valid: false},
      {name: "Infinity", value: Infinity, valid: false},
      {name: "-Infinity", value: -Infinity, valid: false},
      {name: "NaN", value: NaN, valid: false},
      {name: '"true"', value: "true", valid: false},
      {name: '"false"', value: "false", valid: false},
      {name: "undefined", value: undefined, valid: false},
      {name: "null", value: null, valid: false},
      {name: "[]", value: [], valid: false},
      {name: "{}", value: {}, valid: false},
      {name: "new Date()", value: new Date(), valid: false},
      {name: "/regex/", value: /regex/, valid: false},
    ];

    runTests(type, items);
  });

  describe("read(\"query\", val)", function () {
    const type: IntegerType = new IntegerType();
    assert.strictEqual(type.read("qs", "0"), 0);
    assert.strictEqual(type.read("qs", "1"), 1);
    assert.strictEqual(type.read("qs", "-1"), -1);
    assert.strictEqual(type.read("qs", "-1234"), -1234);
    assert.strictEqual(type.read("qs", "2147483647"), 2147483647);
    assert.strictEqual(type.read("qs", "-2147483648"), -2147483648);
  });

  describe("Bound integer", function () {
    const type: IntegerType = $Sint8;

    const items: TypedValue[] = [
      // Valid values
      {name: "0", value: 0, valid: true},
      {name: "1", value: 1, valid: true},
      {name: "3", value: 3, valid: true},
      {name: "7", value: 7, valid: true},
      {name: "15", value: 15, valid: true},
      {name: "31", value: 31, valid: true},
      {name: "63", value: 63, valid: true},
      {name: "127", value: 127, valid: true},
      {name: "-128", value: -128, valid: true},
      // Invalid values
      {name: "-129", value: -129, valid: false},
      {name: "128", value: 128, valid: false},
    ];

    runTests(type, items);
  });
});
