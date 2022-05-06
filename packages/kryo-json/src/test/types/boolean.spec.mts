import { $Boolean } from "kryo/boolean";
import { registerErrMochaTests, registerMochaSuites, TestItem } from "kryo-testing";

import { JSON_READER } from "../../lib/json-reader.mjs";
import { JSON_WRITER } from "../../lib/json-writer.mjs";

describe("kryo-json | Boolean", function () {
  describe("Default", function () {
    const items: TestItem[] = [
      {name: "true", value: true, io: [{writer: JSON_WRITER, reader: JSON_READER, raw: "true"}]},
      {name: "false", value: false, io: [{writer: JSON_WRITER, reader: JSON_READER, raw: "false"}]},
    ];

    registerMochaSuites($Boolean, items);

    describe("Reader", function () {
      const invalids: string[] = [
        "1",
        "\"on\"",
        "\"true\"",
      ];
      registerErrMochaTests(JSON_READER, $Boolean, invalids);
    });
  });
});
