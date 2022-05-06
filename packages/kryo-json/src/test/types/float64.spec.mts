import { Float64Type } from "kryo/float64";
import { registerErrMochaTests, registerMochaSuites, TestItem } from "kryo-testing";

import { JSON_READER } from "../../lib/json-reader.mjs";
import { JSON_WRITER } from "../../lib/json-writer.mjs";

describe("kryo-json | Float64", function () {
  const $Float64: Float64Type = new Float64Type();

  const items: TestItem[] = [
    {
      name: "0",
      value: 0,
      io: [
        {writer: JSON_WRITER, reader: JSON_READER, raw: "0"},
      ],
    },
    {
      name: "1",
      value: 1,
      io: [
        {writer: JSON_WRITER, reader: JSON_READER, raw: "1"},
      ],
    },
    {
      name: "-1",
      value: -1,
      io: [
        {writer: JSON_WRITER, reader: JSON_READER, raw: "-1"},
      ],
    },
    {
      name: "1e3",
      value: 1e3,
      io: [
        {writer: JSON_WRITER, reader: JSON_READER, raw: "1000"},
      ],
    },
    {
      name: "-1e3",
      value: -1e3,
      io: [
        {writer: JSON_WRITER, reader: JSON_READER, raw: "-1000"},
      ],
    },
    {
      name: "Number.MAX_SAFE_INTEGER",
      value: Number.MAX_SAFE_INTEGER,
      io: [
        {writer: JSON_WRITER, reader: JSON_READER, raw: "9007199254740991"},
      ],
    },
    {
      name: "Number.MIN_SAFE_INTEGER",
      value: Number.MIN_SAFE_INTEGER,
      io: [
        {writer: JSON_WRITER, reader: JSON_READER, raw: "-9007199254740991"},
      ],
    },
    {
      name: "Number.MAX_VALUE",
      value: Number.MAX_VALUE,
      io: [
        {writer: JSON_WRITER, reader: JSON_READER, raw: "1.7976931348623157e+308"},
      ],
    },
    {
      name: "Number.MIN_VALUE",
      value: Number.MIN_VALUE,
      io: [
        {writer: JSON_WRITER, reader: JSON_READER, raw: "5e-324"},
      ],
    },
    {
      name: "0.5",
      value: 0.5,
      io: [
        {writer: JSON_WRITER, reader: JSON_READER, raw: "0.5"},
      ],
    },
    {
      name: "0.0001",
      value: 0.0001,
      io: [
        {writer: JSON_WRITER, reader: JSON_READER, raw: "0.0001"},
      ],
    },
    {
      name: "Number.EPSILON",
      value: Number.EPSILON,
      io: [
        {writer: JSON_WRITER, reader: JSON_READER, raw: "2.220446049250313e-16"},
      ],
    },
  ];

  registerMochaSuites($Float64, items);

  describe("Reader", function () {
    const invalids: string[] = [
      "null",
      "true",
      "false",
      "",
      "\"\"",
      "\"0\"",
      "\"null\"",
      "\"true\"",
      "\"false\"",
      "\"NaN\"",
      "\"Infinity\"",
      "\"-Infinity\"",
      "[]",
      "{}",
      "\"1970-01-01T00:00:00.000Z\"",
    ];
    registerErrMochaTests(JSON_READER, $Float64, invalids);
  });

  describe("NaN support", function () {
    const $Float64WithNan: Float64Type = new Float64Type({allowNaN: true});
    const items: TestItem[] = [
      {
        value: 0,
        io: [
          {writer: JSON_WRITER, reader: JSON_READER, raw: "0"},
        ],
      },
      {
        value: 1,
        io: [
          {writer: JSON_WRITER, reader: JSON_READER, raw: "1"},
        ],
      },
      {
        value: NaN,
        io: [
          {writer: JSON_WRITER, reader: JSON_READER, raw: "\"NaN\""},
        ],
      },
    ];

    registerMochaSuites($Float64WithNan, items);

    describe("Reader", function () {
      const invalids: string[] = [
        "\"Infinity\"",
        "\"-Infinity\"",
      ];
      registerErrMochaTests(JSON_READER, $Float64WithNan, invalids);
    });
  });

  describe("Infinity support", function () {
    const $Float64WithInfinity: Float64Type = new Float64Type({allowInfinity: true});
    const items: TestItem[] = [
      {
        value: 0,
        io: [
          {writer: JSON_WRITER, reader: JSON_READER, raw: "0"},
        ],
      },
      {
        value: 1,
        io: [
          {writer: JSON_WRITER, reader: JSON_READER, raw: "1"},
        ],
      },
      {
        value: Infinity,
        io: [
          {writer: JSON_WRITER, reader: JSON_READER, raw: "\"+Infinity\""},
          {reader: JSON_READER, raw: "\"Infinity\""},
        ],
      },
      {
        value: -Infinity,
        io: [
          {writer: JSON_WRITER, reader: JSON_READER, raw: "\"-Infinity\""},
        ],
      },
    ];

    registerMochaSuites($Float64WithInfinity, items);

    describe("Reader", function () {
      const invalids: string[] = [
        "\"NaN\"",
      ];
      registerErrMochaTests(JSON_READER, $Float64WithInfinity, invalids);
    });
  });
});
