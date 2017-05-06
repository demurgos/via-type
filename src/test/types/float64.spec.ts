import {Float64Type} from "../../lib/types/float64";
import {runTests, TypedValue} from "../helpers/test";

describe("Float64Type", function () {
  const type: Float64Type = new Float64Type();

  const items: TypedValue[] = [
    {
      name: "0",
      value: 0,
      valid: true,
      output: {
        json: 0
      }
    },
    {name: "1", value: 1, valid: true},
    {name: "-1", value: -1, valid: true},
    {name: "2", value: 2, valid: true},
    {name: "1e3", value: 1e3, valid: true},
    {name: "-1e3", value: 1e3, valid: true},
    {name: "Number.MAX_SAFE_INTEGER", value: Number.MAX_SAFE_INTEGER, valid: true},
    {name: "Number.MIN_SAFE_INTEGER", value: Number.MIN_SAFE_INTEGER, valid: true},
    {name: "Number.MAX_VALUE", value: Number.MAX_VALUE, valid: true},
    {name: "0.5", value: 0.5, valid: true},
    {name: "0.0001", value: 0.0001, valid: true},
    {name: "Number.EPSILON", value: Number.EPSILON, valid: true},

    {name: "new Number(1)", value: new Number(1), valid: false},
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
    {name: "/regex/", value: /regex/, valid: false}
  ];

  runTests(type, items);
});
