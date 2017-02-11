import {assert} from "chai";
import {runTests, TypedValue} from "../test/test";
import {StringType} from "./string";

describe("StringType", function () {
  describe("basic support", function() {
    const type: StringType = new StringType();

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
      {name: "/regex/", value: /regex/, valid: false}
    ];

    runTests(type, items);
  });

  describe("unicode support", function() {
    const simpleString: StringType = new StringType({
      unicodeSupplementaryPlanes: false,
      unicodeNormalization: false,
      maxLength: 1
    });

    const unicodeString: StringType = new StringType({
      unicodeSupplementaryPlanes: true,
      unicodeNormalization: true,
      maxLength: 1
    });

    const simpleStringItems: TypedValue[] = [
      // Valid items
      {name: '"" with simple string type', value: "", valid: true},
      {name: '"a" with simple string type', value: "a", valid: true},
      {name: '"∑" with simple string type', value: "∑", valid: true},
      {name: '"𝄞" with simple string type', value: "𝄞", valid: false}
    ];

    const unicodeStringItems: TypedValue[] = [
      // Valid items
      {name: '"" with unicode string type', value: "", valid: true},
      {name: '"a" with unicode string type', value: "a", valid: true},
      {name: '"∑" with unicode string type', value: "∑", valid: true},
      {name: '"𝄞" with unicode string type', value: "𝄞", valid: true}
    ];

    runTests(simpleString, simpleStringItems);
    runTests(unicodeString, unicodeStringItems);

    it("NFC normalization of then ångström symbol Å", function() {
      const inputAngstrom: string = "\u212b";
      // This should pass with the maxLength limit because of normalization
      const inputNfdAngstrom: string = "\u0041\u030a";
      const inputNfcAngstrom: string = "\u00c5";

      const angstrom: string = unicodeString.readSync("json-doc", inputAngstrom);
      const nfdAngstrom: string = unicodeString.readSync("json-doc", inputNfdAngstrom);
      const nfcAngstrom: string = unicodeString.readSync("json-doc", inputNfcAngstrom);

      assert.equal(nfcAngstrom, "\u00c5", "NFC normalization is not preserved");
      assert.equal(angstrom, "\u00c5", "Standard ångström symbol is not normalized");
      assert.equal(nfdAngstrom, "\u00c5", "NFD ångström is not normalized to NFC");
    });
  });

  //
  // runTestSync(type, falsyItems);
  //
  // describe ("options.lowerCase", function () {
  //   let typeLowerCase = new StringTypeSync({lowerCase: true});
  //   let items: RunTestItem[] = [
  //     {name: "abc", value: "abc", message: null},
  //     {name: "ABC", value: "ABC", message: ""},
  //     {name: "Abc", value: "Abc", message: ""},
  //     {name: "aBc", value: "aBc", message: ""}
  //   ];
  //   runTestSync(typeLowerCase, items);
  //
  //   describe ("override to true", function() {
  //     runTestSync(type, [
  //       {name: "abc", value: "abc", message: null, options: {lowerCase: true}},
  //       {name: "Abc", value: "Abc", message: "", options: {lowerCase: true}}
  //     ]);
  //   });
  //
  //   describe ("override to false", function() {
  //     runTestSync(typeLowerCase, [
  //       {name: "abc", value: "abc", message: null, options: {lowerCase: false}},
  //       {name: "Abc", value: "Abc", message: null, options: {lowerCase: false}}
  //     ]);
  //   });
  //
  // });
});
