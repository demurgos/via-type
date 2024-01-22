import { assert as chaiAssert } from "chai";
import {readOrThrow} from "kryo";
import {AnyType} from "kryo/any";
import {RecordIoType, RecordType} from "kryo/record";

import {QsReader} from "../../lib/qs-reader.mjs";
import {QsValueReader} from "../../lib/qs-value-reader.mjs";

describe("kryo-qs | Any", function () {
  describe("with JsonReader", function () {
    it("should read the expected top-level values", function () {
      const reader: QsReader = new QsReader();
      const $Any: AnyType = new AnyType();
      chaiAssert.deepEqual(readOrThrow($Any, reader, "0"), "0");
      chaiAssert.deepEqual(readOrThrow($Any, reader, "foo=bar"), "foo=bar");
    });
    it("should read the expected nested values", function () {
      const reader: QsReader = new QsReader();
      const $Any: AnyType = new AnyType();

      interface FooBarQuz {
        foo: any;
      }

      const $FooBarQuz: RecordIoType<FooBarQuz> = new RecordType({
        properties: {foo: {type: $Any}},
      });

      chaiAssert.deepEqual(readOrThrow($FooBarQuz, reader, "foo[bar]=quz"), {foo: {bar: "quz"}});
    });
  });

  describe("with JsonValueReader", function () {
    it("should read the expected values", function () {
      const reader: QsValueReader = new QsValueReader();
      const $Any: AnyType = new AnyType();
      chaiAssert.deepEqual(readOrThrow($Any, reader, 0), 0);
      chaiAssert.deepEqual(readOrThrow($Any, reader, {foo: "bar"}), {foo: "bar"});
    });
  });
});
