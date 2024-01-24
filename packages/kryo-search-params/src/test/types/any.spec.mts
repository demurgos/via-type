import {assert as chaiAssert} from "chai";
import {readOrThrow} from "kryo";
import {$Any, AnyType} from "kryo/any";
import {RecordIoType, RecordType} from "kryo/record";
import {SEARCH_PARAMS_READER} from "../../lib/search-params-reader.mjs";
import {SEARCH_PARAMS_VALUE_READER} from "../../lib/search-params-value-reader.mjs";

describe("kryo-search-params | Any", function () {
  describe("with JsonReader", function () {
    it("should read the expected top-level values", function () {
      const $Any: AnyType = new AnyType();
      chaiAssert.deepEqual(readOrThrow($Any, SEARCH_PARAMS_READER, "0"), "0");
      chaiAssert.deepEqual(readOrThrow($Any, SEARCH_PARAMS_READER, "foo=bar"), "foo=bar");
    });
    it("should read the expected nested values", function () {
      const $Any: AnyType = new AnyType();

      interface FooBarQuz {
        foo: unknown;
      }

      const $FooBarQuz: RecordIoType<FooBarQuz> = new RecordType({
        properties: {foo: {type: $Any}},
      });

      chaiAssert.deepEqual(readOrThrow($FooBarQuz, SEARCH_PARAMS_READER, "foo=\{\"bar\":\"quz\"}"), {foo: "{\"bar\":\"quz\"}"});
    });
  });

  describe("with JsonValueReader", function () {
    it("should read the expected values", function () {
      chaiAssert.deepEqual(readOrThrow($Any, SEARCH_PARAMS_VALUE_READER, "0"), "0");
      chaiAssert.deepEqual(readOrThrow($Any, SEARCH_PARAMS_VALUE_READER, "{\"foo\": \"bar\"}"), "{\"foo\": \"bar\"}");
    });
  });
});
