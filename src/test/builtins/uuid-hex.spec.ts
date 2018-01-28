import { $UuidHex } from "../../lib/builtins/uuid-hex";
import { runTests, TypedValue } from "../helpers/test";

describe("$UuidHex", function () {
  const items: TypedValue[] = [
    // Valid values
    {value: "bbb823fc-f020-4e96-97b4-5d08907a463f", valid: true},
    {value: "7343ddeb-bc62-40bf-beb5-13f885c22852", valid: true},
    // Invalid values
    {value: "bbb823fcf0204e9697b45d08907a463f", valid: false},
    {value: "7343DDEB-BC62-40BF-BEB5-13F885C22852", valid: false},
    {value: "7343ddeb-bc62-40bf-beb5-13f885c2285", valid: false},
    {value: "7343ddeb-bc62-40bf-beb5-13f885c228522", valid: false},
    {value: "7343zzzz-zz62-40zz-zzz5-13z885z22852", valid: false},
  ];

  runTests($UuidHex, items);
});
