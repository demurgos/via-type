import chai from "chai";
import { AnyType } from "kryo/any";
import { RecordIoType, RecordType } from "kryo/record";

import { JsonReader } from "../../lib/json-reader.mjs";
import { JsonValueReader } from "../../lib/json-value-reader.mjs";

describe("kryo-json | Any", function () {
  describe("with JsonReader", function () {
    it("should read the expected top-level values", function () {
      const reader: JsonReader = new JsonReader();
      const $Any: AnyType = new AnyType();
      chai.assert.deepEqual($Any.read(reader, "0"), "0");
      chai.assert.deepEqual($Any.read(reader, "{\"foo\": \"bar\""), "{\"foo\": \"bar\"");
    });
    it("should read the expected nested values", function () {
      const reader: JsonReader = new JsonReader();
      const $Any: AnyType = new AnyType();

      interface FooBarQuz {
        foo: any;
      }

      const $FooBarQuz: RecordIoType<FooBarQuz> = new RecordType({
        properties: {foo: {type: $Any}},
      });

      chai.assert.deepEqual($FooBarQuz.read(reader, "{\"foo\": {\"bar\": \"quz\"}}"), {foo: {bar: "quz"}});
    });
  });

  describe("with JsonValueReader", function () {
    it("should read the expected values", function () {
      const reader: JsonValueReader = new JsonValueReader();
      const $Any: AnyType = new AnyType();
      chai.assert.deepEqual($Any.read(reader, 0), 0);
      chai.assert.deepEqual($Any.read(reader, {foo: "bar"}), {foo: "bar"});
    });
  });
});
