import chai from "chai";
import unorm from "unorm";

import { CodepointStringType } from "../../lib/codepoint-string.mjs";
import { runTests, TypedValue } from "../helpers/test.mjs";

describe("CodepointStringType", function () {
  describe("basic support", function () {
    const type: CodepointStringType = new CodepointStringType({maxCodepoints: 500, unorm});

    const items: TypedValue[] = [
      // Valid items
      {name: "\"\"", value: "", valid: true},
      {name: "\"Hello World!\"", value: "Hello World!", valid: true},
      {name: "Drop the bass", value: "ԂЯØǷ Łƕ੬ ɃɅϨϞ", valid: true},
      // Invalid items
      /* tslint:disable-next-line:no-construct */
      {name: "new String(\"stringObject\")", value: new String("stringObject"), valid: false},
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

  describe("Ensure valid codepoints with Javascript (UCS2) strings", function () {
    it("should accept the empty string, when requiring length exactly 0", function () {
      chai.assert.isTrue(new CodepointStringType({minCodepoints: 0, maxCodepoints: 0, unorm}).test(""));
    });
    it("should accept the string \"a\" (ASCII codepoint), when requiring length exactly 1", function () {
      chai.assert.isTrue(new CodepointStringType({minCodepoints: 1, maxCodepoints: 1, unorm}).test("a"));
    });
    it("should accept the string \"∑\" (BMP codepoint), when requiring length exactly 1", function () {
      chai.assert.isTrue(new CodepointStringType({minCodepoints: 1, maxCodepoints: 1, unorm}).test("∑"));
    });
    it("should reject the string \"𝄞\" (non-BMP codepoint), when requiring length exactly 2", function () {
      chai.assert.isFalse(new CodepointStringType({minCodepoints: 2, maxCodepoints: 2, unorm}).test("𝄞"));
    });
    it("should accept the string \"𝄞\" (non-BMP codepoint), when requiring length exactly 1", function () {
      chai.assert.isTrue(new CodepointStringType({minCodepoints: 1, maxCodepoints: 1, unorm}).test("𝄞"));
    });
    describe("should reject unmatched surrogate halves", function () {
      // 𝄞 corresponds to the surrogate pair (0xd834, 0xdd1e)
      const type: CodepointStringType = new CodepointStringType({maxCodepoints: 500, unorm});
      const items: string[] = ["\ud834", "a\ud834", "\ud834b", "a\ud834b", "\udd1e", "a\udd1e", "\udd1eb", "a\udd1eb"];
      for (const item of items) {
        it(JSON.stringify(item), function () {
          chai.assert.isFalse(type.test(item));
        });
      }
    });
    it("should reject reversed (invalid) surrogate pairs", function () {
      chai.assert.isFalse(new CodepointStringType({maxCodepoints: 500, unorm}).test("\udd1e\ud834"));
    });
  });
});
