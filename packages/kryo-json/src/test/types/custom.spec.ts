import incident from "incident";
import { Reader, Writer } from "kryo";
import { CustomType } from "kryo/lib/custom";
import { createInvalidTypeError } from "kryo/lib/errors/invalid-type";
import { readVisitor } from "kryo/lib/readers/read-visitor";
import { registerErrMochaTests, registerMochaSuites, TestItem } from "kryo-testing";

import { JSON_READER } from "../../lib/json-reader.js";
import { JSON_WRITER } from "../../lib/json-writer.js";

describe("kryo-json | Custom", function () {
  describe("ComplexNumber", function () {
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
          throw new incident.Incident("InvalidInput", {input});
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
      read<R>(reader: Reader<R>, raw: R): Complex {
        return reader.readString(raw, readVisitor({
          fromString: (input: string): Complex => {
            return Complex.fromString(input);
          },
          fromFloat64: (input: number): Complex => {
            return new Complex(input, 0);
          },
        }));
      },
      write<W>(writer: Writer<W>, value: Complex): W {
        return writer.writeString(value.toString());
      },
      testError(value: unknown): Error | undefined {
        if (!(value instanceof Complex)) {
          return createInvalidTypeError("Complex", value);
        }
        return undefined;
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
          {writer: JSON_WRITER, reader: JSON_READER, raw: "\"0\""},
        ],
      },
      {
        name: "Complex {real: 1, imaginary: 0}",
        value: new Complex(1, 0),
        io: [
          {writer: JSON_WRITER, reader: JSON_READER, raw: "\"1\""},
        ],
      },
      {
        name: "Complex {real: 0, imaginary: 2}",
        value: new Complex(0, 2),
        io: [
          {writer: JSON_WRITER, reader: JSON_READER, raw: "\"2j\""},
        ],
      },
      {
        name: "Complex {real: 3, imaginary: 4}",
        value: new Complex(3, 4),
        io: [
          {writer: JSON_WRITER, reader: JSON_READER, raw: "\"3 + 4j\""},
        ],
      },
    ];

    registerMochaSuites($Complex, items);

    describe("Reader", function () {
      const invalids: string[] = [
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
      registerErrMochaTests(JSON_READER, $Complex, invalids);
    });
  });
});
