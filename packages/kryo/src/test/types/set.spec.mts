import { IntegerType } from "../../lib/integer.mjs";
import { SetType } from "../../lib/set.mjs";
import { runTests, TypedValue } from "../helpers/test.mjs";

describe("SetType", function () {
  describe("General", function () {
    const $IntSet: SetType<number> = new SetType({
      itemType: new IntegerType(),
      maxSize: 2,
    });

    const items: TypedValue[] = [
      {
        name: "new Set()",
        value: new Set(),
        valid: true,
      },
      {
        name: "new Set([1])",
        value: new Set([1]),
        valid: true,
      },
      {
        name: "new Set([2, 3])",
        value: new Set([2, 3]),
        valid: true,
      },
      {
        name: "new Set([3, 2])",
        value: new Set([3, 2]),
        valid: true,
      },
      {
        name: "new Set([4, 5, 6])",
        value: new Set([4, 5, 6]),
        valid: false,
      },
      {
        name: "new Set([0.5])",
        value: new Set([0.5]),
        valid: false,
      },
      {
        name: "new Set([null])",
        value: new Set([null]),
        valid: false,
      },
      {
        name: "new Set([undefined])",
        value: new Set([undefined]),
        valid: false,
      },
      {
        value: [],
        valid: false,
      },
      {
        value: [1],
        valid: false,
      },
      {
        value: [2, 3],
        valid: false,
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
      {name: "{}", value: {}, valid: false},
      {name: "/regex/", value: /regex/, valid: false},
    ];

    runTests($IntSet, items);
  });
});
