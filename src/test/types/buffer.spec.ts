import {BufferType} from "../../lib/buffer";
import {runTests, TypedValue} from "../helpers/test";

describe("BufferType", function () {
  const shortBuffer: BufferType = new BufferType({
    maxLength: 2,
  });

  const items: TypedValue[] = [
    {
      name: "Uint8Array.from([])",
      value: Uint8Array.from([]),
      valid: true,
      output: {
        json: "",
      },
    },
    {
      name: "Uint8Array.from([1])",
      value: Uint8Array.from([1]),
      valid: true,
      output: {
        json: "01",
      },
    },
    {
      name: "Uint8Array.from([2, 3])",
      value: Uint8Array.from([2, 3]),
      valid: true,
      output: {
        json: "0203",
      },
    },
    {
      name: "Uint8Array.from([4, 5, 6])",
      value: Uint8Array.from([4, 5, 6]),
      valid: false,
    },
    {
      name: "[7]",
      value: [7],
      valid: false,
    },
    {
      name: "[0.5]",
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
      valid: false,
    },
    {
      name: "new Array(0)",
      value: new Array(0),
      valid: false,
    },
    {
      name: "new Array(1)",
      value: new Array(1),
      valid: false,
    },
    {
      name: "new Array(2)",
      value: new Array(2),
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

  runTests(shortBuffer, items);
});
