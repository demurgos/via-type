import {assert} from "chai";
import {Ucs2StringType} from "../../lib/ucs2-string";
import {runTests, TypedValue} from "../helpers/test";

describe("Ucs2StringType", function () {
  describe("basic support", function () {
    const type: Ucs2StringType = new Ucs2StringType({maxLength: 500});

    const items: TypedValue[] = [
      // Valid items
      {name: '""', value: "", valid: true},
      {name: '"Hello World!"', value: "Hello World!", valid: true},
      {name: "Drop the bass", value: "ԂЯØǷ Łƕ੬ ɃɅϨϞ", valid: true},
      // Invalid items
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
      {name: "[]", value: [], valid: false},
      {name: "{}", value: {}, valid: false},
      {name: "new Date()", value: new Date(), valid: false},
      {name: "/regex/", value: /regex/, valid: false},
    ];

    runTests(type, items);
  });

  describe("Simple UCS2 behavior", function () {
    it("should accept the empty string, when requiring length exactly 0", function () {
      assert.isTrue(new Ucs2StringType({minLength: 0, maxLength: 0}).test(""));
    });
    it(`should accept the string "a" (ASCII codepoint), when requiring length exactly 1`, function () {
      assert.isTrue(new Ucs2StringType({minLength: 1, maxLength: 1}).test("a"));
    });
    it(`should accept the string "∑" (BMP codepoint), when requiring length exactly 1`, function () {
      assert.isTrue(new Ucs2StringType({minLength: 1, maxLength: 1}).test("∑"));
    });
    it(`should accept the string "𝄞" (non-BMP codepoint), when requiring length exactly 2`, function () {
      assert.isTrue(new Ucs2StringType({minLength: 2, maxLength: 2}).test("𝄞"));
    });
    it(`should reject the string "𝄞" (non-BMP codepoint), when requiring length exactly 1`, function () {
      assert.isFalse(new Ucs2StringType({minLength: 1, maxLength: 1}).test("𝄞"));
    });
    it(`should accept unmatched surrogate halves`, function () {
      // 𝄞 corresponds to the surrogate pair (0xd834, 0xdd1e)
      const type: Ucs2StringType = new Ucs2StringType({maxLength: 500});
      const items: string[] = ["\ud834", "a\ud834", "\ud834b", "a\ud834b", "\udd1e", "a\udd1e", "\udd1eb", "a\udd1eb"];
      for (const item of items) {
        it(JSON.stringify(item), function () {
          assert.isTrue(type.test(item));
        });
      }
    });
    it(`should accept reversed (invalid) surrogate pairs`, function () {
      assert.isTrue(new Ucs2StringType({maxLength: 500}).test("\udd1e\ud834"));
    });
  });
});
