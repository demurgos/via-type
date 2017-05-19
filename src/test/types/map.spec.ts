import {Int32Type} from "../../lib/types/int32";
import {MapType} from "../../lib/types/map";
import {runTests, TypedValue} from "../helpers/test";

describe.only("Map", function () {
  const mapType: MapType<number, number> = new MapType({
    keyType: new Int32Type(),
    valueType: new Int32Type(),
    maxSize: 5
  });

  const items: TypedValue[] = [
    {
      name: "new Map([[1, 100], [2, 200]])",
      value: new Map([[1, 100], [2, 200]]),
      valid: true,
      output: {
        json: {1: 100, 2: 200},
        qs: "ignore"
      }
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
    {name: "[]", value: [], valid: false},
    {name: "{}", value: {}, valid: false},
    {name: "/regex/", value: /regex/, valid: false}
  ];

  runTests(mapType, items);
});
