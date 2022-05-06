import { IntegerType } from "../../lib/integer.mjs";
import { MapType } from "../../lib/map.mjs";
import { Ucs2StringType } from "../../lib/ucs2-string.mjs";
import { runTests, TypedValue } from "../helpers/test.mjs";

describe("Map", function () {
  const mapType: MapType<number, number> = new MapType({
    keyType: new IntegerType(),
    valueType: new IntegerType(),
    maxSize: 5,
  });

  const items: TypedValue[] = [
    {
      name: "new Map([[1, 100], [2, 200]])",
      value: new Map([[1, 100], [2, 200]]),
      valid: true,
    },

    {name: "new Date(0)", value: new Date(0), valid: false},
    {name: "0", value: 0, valid: false},
    {name: "1", value: 1, valid: false},
    {name: "\"\"", value: "", valid: false},
    {name: "\"0\"", value: "0", valid: false},
    {name: "\"true\"", value: "true", valid: false},
    {name: "\"false\"", value: "false", valid: false},
    {name: "Infinity", value: Infinity, valid: false},
    {name: "-Infinity", value: -Infinity, valid: false},
    {name: "NaN", value: NaN, valid: false},
    {name: "undefined", value: undefined, valid: false},
    {name: "null", value: null, valid: false},
    {name: "[]", value: [], valid: false},
    {name: "{}", value: {}, valid: false},
    {name: "/regex/", value: /regex/, valid: false},
  ];

  runTests(mapType, items);
});

describe("Map (assumeStringKey)", function () {
  const mapType: MapType<string, number> = new MapType({
    keyType: new Ucs2StringType({pattern: /^a+$/, maxLength: 10}),
    valueType: new IntegerType(),
    maxSize: 5,
    assumeStringKey: true,
  });

  const items: TypedValue[] = [
    {
      name: "new Map([[a, 100], [aa, 200]])",
      value: new Map([["a", 100], ["aa", 200]]),
      valid: true,
    },
  ];

  runTests(mapType, items);
});
