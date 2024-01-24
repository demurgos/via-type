import {CheckId, KryoContext, Reader, Result, writeError,Writer} from "kryo";
import {CheckKind} from "kryo/checks/check-kind";
import {CustomType} from "kryo/custom";
import {readVisitor} from "kryo/readers/read-visitor";
import {registerErrMochaTests, registerMochaSuites, TestItem} from "kryo-testing";

import {SEARCH_PARAMS_WRITER} from "../../lib/search-params-writer.mjs";
import {SEARCH_PARAMS_READER} from "../../lib/search-params-reader.mjs";

describe("kryo-search-params | Custom", function () {
  describe("ComplexNumber", function () {
    class ComplexParseError extends Error {
      public input: string;

      public constructor(input: string) {
        super(`invalid input format for \`Complex\`: ${JSON.stringify(input)}`);
        this.input = input;
      }
    }

    /**
     * Represents a complex number.
     * It only deals with complex number with small unsigned integer cartesian components for
     * simplicity.
     */
    class Complex {
      readonly real: number;
      readonly imaginary: number;

      constructor(real: number, imaginary: number) {
        this.real = real;
        this.imaginary = imaginary;
        Object.freeze(this);
      }

      static fromString(input: string): Complex {
        const realMatch: RegExpExecArray | null = /^(\d+)(?:\s*\+\s*\d+j)?$/.exec(input);
        const imaginaryMatch: RegExpExecArray | null = /^(?:\d+\s*\+\s*)?(\d+)j$/.exec(input);
        if (realMatch === null && imaginaryMatch === null) {
          throw new ComplexParseError(input);
        }
        const real: number = realMatch !== null ? parseInt(realMatch[1], 10) : 0;
        const imaginary: number = imaginaryMatch !== null ? parseInt(imaginaryMatch[1], 10) : 0;
        return new Complex(real, imaginary);
      }

      toString(): string {
        const parts: string[] = [];
        if (this.real !== 0) {
          parts.push(this.real.toString(10));
        }
        if (this.imaginary !== 0) {
          parts.push(`${this.imaginary.toString(10)}j`);
        }
        // tslint:disable-next-line:strict-boolean-expressions
        return parts.join(" + ") || "0";
      }
    }

    const $Complex: CustomType<Complex> = new CustomType({
      read<R>(cx: KryoContext, reader: Reader<R>, raw: R): Result<Complex, CheckId> {
        return reader.readString(cx, raw, readVisitor({
          fromString: (input: string): Result<Complex, CheckId> => {
            try {
              const value = Complex.fromString(input);
              return {ok: true, value};
            } catch (e) {
              if (e instanceof ComplexParseError) {
                return writeError(cx, {check: CheckKind.BaseType, expected: ["Object"]});
              } else {
                throw e;
              }
            }
          },
          fromFloat64: (input: number): Result<Complex, CheckId> => {
            const value = new Complex(input, 0);
            return {ok: true, value};
          },
        }));
      },
      write<W>(writer: Writer<W>, value: Complex): W {
        return writer.writeString(value.toString());
      },
      test(cx: KryoContext, value: unknown): Result<Complex, CheckId> {
        if (!(value instanceof Complex)) {
          return writeError(cx, {check: CheckKind.BaseType, expected: ["Object"]});
        }
        return {ok: true, value};
      },
      equals(value1: Complex, value2: Complex): boolean {
        return value1.real === value2.real && value1.imaginary === value2.imaginary;
      },
      clone(value: Complex): Complex {
        return new Complex(value.real, value.imaginary);
      },
    });

    const items: TestItem[] = [
      {
        name: "Complex {real: 0, imaginary: 0}",
        value: new Complex(0, 0),
        io: [
          {writer: SEARCH_PARAMS_WRITER, reader: SEARCH_PARAMS_READER, raw: "_=0"},
        ],
      },
      {
        name: "Complex {real: 1, imaginary: 0}",
        value: new Complex(1, 0),
        io: [
          {writer: SEARCH_PARAMS_WRITER, reader: SEARCH_PARAMS_READER, raw: "_=1"},
        ],
      },
      {
        name: "Complex {real: 0, imaginary: 2}",
        value: new Complex(0, 2),
        io: [
          {writer: SEARCH_PARAMS_WRITER, reader: SEARCH_PARAMS_READER, raw: "_=2j"},
        ],
      },
      {
        name: "Complex {real: 3, imaginary: 4}",
        value: new Complex(3, 4),
        io: [
          {writer: SEARCH_PARAMS_WRITER, reader: SEARCH_PARAMS_READER, raw: "_=3+%2B+4j"},
          {reader: SEARCH_PARAMS_READER, raw: "_=3 %2B 4j"},
        ],
      },
    ];

    registerMochaSuites($Complex, items);

    describe("Reader", function () {
      const invalids: string[] = [
        "_=3 + 4j",
        "null",
        "true",
        "false",
        "",
        "0",
        "1",
        "0.5",
        "0.0001",
        "2.220446049250313e-16",
        "9007199254740991",
        "-9007199254740991",
        "\"\"",
        "\"0\"",
        "\"1\"",
        "\"null\"",
        "\"true\"",
        "\"false\"",
        "\"undefined\"",
        "\"NaN\"",
        "\"Infinity\"",
        "\"-Infinity\"",
        "\"foo\"",
        "[]",
        "{}",
        "\"1970-01-01T00:00:00.000Z\"",
      ];
      registerErrMochaTests(SEARCH_PARAMS_READER, $Complex, invalids);
    });
  });
});
