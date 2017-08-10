import {ArrayType} from "../../lib/types/array";
import {IntegerType} from "../../lib/types/integer";
import {runTests, TypedValue} from "../helpers/test";

describe("ArrayType", function () {
  const integersArray: ArrayType<number> = new ArrayType({
    itemType: new IntegerType(),
    maxLength: 2,
  });

  const items: TypedValue[] = [
    {
      value: [],
      valid: true,
      output: {
        json: [],
      },
    },
    {
      value: [1],
      valid: true,
      output: {
        json: [1],
      },
    },
    {
      value: [2, 3],
      valid: true,
      output: {
        json: [2, 3],
      },
    },
    {
      value: [4, 5, 6],
      valid: false,
    },
    {
      value: [0.5],
      valid: false,
    },
    {
      name: "[null]",
      value: [null],
      valid: false,
    },
    {
      name: "[undefined]",
      value: [undefined],
      valid: false,
    },
    {
      name: "new Array()",
      value: new Array(),
      valid: true,
    },
    {
      name: "new Array(0)",
      value: new Array(0),
      valid: true,
    },
    {
      name: "new Array(1)",
      value: new Array(1),
      valid: false,
    },

    {name: "new Date(0)", value: new Date(0), valid: false},
    {name: "0", value: 0, valid: false},
    {name: "1", value: 1, valid: false},
    {name: '""', value: "", valid: false},
    {name: '"0"', value: "0", valid: false},
    {name: '"true"', value: "true", valid: false},
    {name: '"false"', value: "false", valid: false},
    {name: "Infinity", value: Infinity, valid: false},
    {name: "-Infinity", value: -Infinity, valid: false},
    {name: "NaN", value: NaN, valid: false},
    {name: "undefined", value: undefined, valid: false},
    {name: "null", value: null, valid: false},
    {name: "{}", value: {}, valid: false},
    {name: "/regex/", value: /regex/, valid: false},
  ];

  runTests(integersArray, items);
});
