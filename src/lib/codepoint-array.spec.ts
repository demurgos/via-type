import {assert} from "chai";
import {runTests, TypedValue} from "../test/test";
import {CodepointArrayType} from "./codepoint-array";

describe("CodepointArrayType", function () {
  describe("basic support", function() {
    const type: CodepointArrayType = new CodepointArrayType();

    const items: TypedValue[] = [
      // Valid items
      {name: "[]", value: [], valid: true},
      // Invalid items
      {name: '""', value: "", valid: false},
      {name: '"Hello World!"', value: "Hello World!", valid: false},
      {name: "Drop the bass", value: "ԂЯØǷ Łƕ੬ ɃɅϨϞ", valid: false},
      {name: 'new String("stringObject")', value: new String("stringObject"), valid: false},
      {name: "0.5", value: 0.5, valid: false},
      {name: "0.0001", value: 0.0001, valid: false},
      {name: "Infinity", value: Infinity, valid: false},
      {name: "-Infinity", value: -Infinity, valid: false},
      {name: "NaN", value: NaN, valid: false},
      {name: "undefined", value: undefined, valid: false},
      {name: "null", value: null, valid: false},
      {name: "true", value: true, valid: false},
      {name: "false", value: false, valid: false},
      {name: "{}", value: {}, valid: false},
      {name: "new Date()", value: new Date(), valid: false},
      {name: "/regex/", value: /regex/, valid: false}
    ];

    runTests(type, items);
  });

  describe("Ensure valid codepoints (not unassigned code-points for unmatched halves)", function() {
    it("should accept the array for the empty string, when requiring length exactly 0", function() {
      assert.isTrue(new CodepointArrayType({minLength: 0, maxLength: 0}).testSync([]));
    });
    it(`should accept the array for the string "a" (ASCII codepoint), when requiring length exactly 1`, function() {
      assert.isTrue(new CodepointArrayType({minLength: 1, maxLength: 1}).testSync([0x61]));
    });
    it(`should accept the array for the string "∑" (BMP codepoint), when requiring length exactly 1`, function() {
      assert.isTrue(new CodepointArrayType({minLength: 1, maxLength: 1}).testSync([0x2211]));
    });
    it(`should reject the array for the string "𝄞" (non-BMP codepoint), when requiring length exactly 2`, function() {
      assert.isFalse(new CodepointArrayType({minLength: 2, maxLength: 2}).testSync([0x1d11e]));
    });
    it(`should accept the array for the string "𝄞" (non-BMP codepoint), when requiring length exactly 1`, function() {
      assert.isTrue(new CodepointArrayType({minLength: 1, maxLength: 1}).testSync([0x1d11e]));
    });
    describe(`should reject unmatched surrogate halves`, function() {
      // 𝄞 corresponds to the surrogate pair (0xd834, 0xdd1e)
      // a and b correspond to 0x61 and 0x62
      const type: CodepointArrayType = new CodepointArrayType();
      const items: number[][] = [
        [0xd834], [0x61, 0xd834], [0xd834, 0x62], [0x61, 0xd834, 0x62],
        [0xdd1e], [0x61, 0xdd1e], [0xdd1e, 0x62], [0x61, 0xdd1e, 0x62]
      ];
      for (const item of items) {
        it (JSON.stringify(item), function() {
          assert.isFalse(type.testSync(item));
        });
      }
    });
    it(`should reject reversed (invalid) surrogate pairs`, function() {
      assert.isFalse(new CodepointArrayType().testSync([0xdd1e, 0xd834]));
    });
  });
});
