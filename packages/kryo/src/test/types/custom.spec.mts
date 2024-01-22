import {writeError} from "../../lib/_helpers/write-error.mjs";
import {CheckKind} from "../../lib/checks/check-kind.mjs";
import { CustomType } from "../../lib/custom.mjs";
import {CheckId, KryoContext, Reader, Result, Writer} from "../../lib/index.mjs";
import { readVisitor } from "../../lib/readers/read-visitor.mjs";
import { runTests, TypedValue } from "../helpers/test.mjs";

describe("Custom", function () {
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

  const complexType: CustomType<Complex> = new CustomType({
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

  const items: TypedValue[] = [
    {
      name: "Complex {real: 0, imaginary: 0}",
      value: new Complex(0, 0),
      valid: true,
    },
    {
      name: "Complex {real: 1, imaginary: 0}",
      value: new Complex(1, 0),
      valid: true,
    },
    {
      name: "Complex {real: 0, imaginary: 2}",
      value: new Complex(0, 2),
      valid: true,
    },
    {
      name: "Complex {real: 3, imaginary: 4}",
      value: new Complex(3, 4),
      valid: true,
    },
    {name: "\"foo\"", value: "bar", valid: false},
    {name: "0", value: 0, valid: false},
    {name: "1", value: 1, valid: false},
    {name: "\"\"", value: "", valid: false},
    {name: "\"0\"", value: "0", valid: false},
    {name: "true", value: true, valid: false},
    {name: "false", value: false, valid: false},
    {name: "Infinity", value: Infinity, valid: false},
    {name: "-Infinity", value: -Infinity, valid: false},
    {name: "new Date(\"1247-05-18T19:40:08.418Z\")", value: new Date("1247-05-18T19:40:08.418Z"), valid: false},
    {name: "NaN", value: NaN, valid: false},
    {name: "undefined", value: undefined, valid: false},
    {name: "null", value: null, valid: false},
    {name: "[]", value: [], valid: false},
    {name: "{}", value: {}, valid: false},
    {name: "/regex/", value: /regex/, valid: false},
  ];

  runTests(complexType, items);
});
