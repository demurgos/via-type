import { $Uint8 } from "../../lib/integer.mjs";
import { runTests, TypedValue } from "../helpers/test.mjs";

describe("$Uint8", function () {
  const items: TypedValue[] = [
    // Valid values
    {name: "0", value: 0, valid: true},
    {name: "-0", value: -0, valid: true},
    {name: "1", value: 1, valid: true},
    {name: "3", value: 3, valid: true},
    {name: "7", value: 7, valid: true},
    {name: "15", value: 15, valid: true},
    {name: "31", value: 31, valid: true},
    {name: "63", value: 63, valid: true},
    {name: "127", value: 127, valid: true},
    {name: "255", value: 255, valid: true},
    // Invalid values
    {name: "-1", value: -1, valid: false},
    {name: "-128", value: -128, valid: false},
    {name: "-255", value: -255, valid: false},
    {name: "-256", value: -256, valid: false},
    {name: "-129", value: -129, valid: false},
    {name: "256", value: 256, valid: false},
  ];

  runTests($Uint8, items);
});
